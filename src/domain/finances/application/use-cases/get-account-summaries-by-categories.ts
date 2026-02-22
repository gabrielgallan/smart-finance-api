import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import dayjs from 'dayjs'
import { InvalidPeriodError } from './errors/invalid-period-error'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { AnyCategoryFoundForAccountError } from './errors/any-category-found-for-account-error'
import { findHighestOperationDay } from '../utils/find-highest-operation-day'
import { calculateTransactionsTotals } from '../utils/calculate-transactions-totals'
import { AccountSummary } from '../../enterprise/entities/value-objects/account-summary'

interface GetAccountSummariesByCategoriesUseCaseRequest {
  memberId: string
  startDate: Date
  endDate: Date
}

type GetAccountSummariesByCategoriesUseCaseResponse = Either<
  | ResourceNotFoundError
  | MemberAccountNotFoundError
  | AnyCategoryFoundForAccountError
  | InvalidPeriodError,
  {
    fullTermAccounSummary: AccountSummary
    byCategoriesSummaries: AccountSummary[]
  }
>

export class GetAccountSummariesByCategoriesUseCase {
  constructor(
    private accountsRepository: IAccountsRepository,
    private transactionsRepository: ITransactionsRepository,
    private categoriesRepository: ICategoriesRepository,
  ) { }

  async execute({
    memberId,
    startDate,
    endDate,
  }: GetAccountSummariesByCategoriesUseCaseRequest): Promise<GetAccountSummariesByCategoriesUseCaseResponse> {
    const startDateJs = dayjs(startDate)
    const endDateJs = dayjs(endDate)

    if (endDateJs.isBefore(startDateJs)) {
      return left(new InvalidPeriodError())
    }

    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    const categories = await this.categoriesRepository.findManyByAccountId(
      account.id.toString(),
    )

    if (categories.length === 0) {
      return left(new AnyCategoryFoundForAccountError())
    }

    const allTransactions = await this.transactionsRepository.findManyByQuery({
      accountId: account.id.toString(),
      interval: { startDate, endDate }
    })

    const allTransactionsTotal = calculateTransactionsTotals({ transactions: allTransactions })

    const allTransactionsSummary = AccountSummary.generate(
      {
        accountId: account.id,
        interval: { startDate, endDate },
        totalIncome: allTransactionsTotal.totalIncome,
        totalExpense: allTransactionsTotal.totalExpense,
        highestIncomeDay: findHighestOperationDay(allTransactionsTotal.incomeTransactions),
        highestExpenseDay: findHighestOperationDay(allTransactionsTotal.expenseTransactions),
        transactionsCount: allTransactions.length,
      }
    )

    const byCategoriesSummaries: AccountSummary[] = []

    for (const category of categories) {
      const transactionsByCategory =
        await this.transactionsRepository.findManyByQuery({
          accountId: account.id.toString(),
          categoryId: category.id.toString(),
          interval: { startDate, endDate }
        })

      // => Income
      const {
        incomeTransactions,
        expenseTransactions,
        totalIncome,
        totalExpense
      } = calculateTransactionsTotals({ transactions: transactionsByCategory })

      const categorySummary = AccountSummary.generate(
        {
          accountId: account.id,
          categoryId: category.id,
          interval: { startDate, endDate },
          totalIncome,
          totalExpense,
          highestIncomeDay: findHighestOperationDay(incomeTransactions),
          highestExpenseDay: findHighestOperationDay(expenseTransactions),
          transactionsCount: transactionsByCategory.length,
        }
      )

      categorySummary.setComparativePercentages(allTransactionsSummary)

      byCategoriesSummaries.push(categorySummary)
    }

    return right({
      fullTermAccounSummary: allTransactionsSummary,
      byCategoriesSummaries,
    })
  }
}
