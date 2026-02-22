import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import dayjs from 'dayjs'
import { InvalidPeriodError } from './errors/invalid-period-error'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { findHighestOperationDay } from '../utils/find-highest-operation-day'
import { calculateTransactionsTotals } from '../utils/calculate-transactions-totals'
import { AccountSummary } from '../../enterprise/entities/value-objects/account-summary'


interface GetAccountSummaryByCategoryUseCaseRequest {
  memberId: string
  categoryId: string
  startDate: Date
  endDate: Date
}

type GetAccountSummaryByCategoryUseCaseResponse = Either<
  | ResourceNotFoundError
  | MemberAccountNotFoundError
  | InvalidPeriodError,
  {
    fullTermAccountSummary: AccountSummary
    byCategorySummary: AccountSummary
  }
>

export class GetAccountSummaryByCategoryUseCase {
  constructor(
    private accountsRepository: IAccountsRepository,
    private transactionsRepository: ITransactionsRepository,
    private categoriesRepository: ICategoriesRepository,
  ) {}

  async execute({
    memberId,
    categoryId,
    startDate,
    endDate,
  }: GetAccountSummaryByCategoryUseCaseRequest): Promise<GetAccountSummaryByCategoryUseCaseResponse> {
    const startDateJs = dayjs(startDate)
    const endDateJs = dayjs(endDate)

    if (endDateJs.isBefore(startDateJs)) {
      return left(new InvalidPeriodError())
    }

    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    const category = await this.categoriesRepository.findByIdAndAccountId(
      categoryId,
      account.id.toString()
    )

    if (!category) {
      return left(new ResourceNotFoundError())
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

    const transactionsByCategory =
      await this.transactionsRepository.findManyByQuery({
        accountId: account.id.toString(),
        categoryId: category.id.toString(),
        interval: { startDate, endDate },
      })

    // => By Category
    const { 
      incomeTransactions,
      expenseTransactions,
      totalIncome,
      totalExpense 
    } = calculateTransactionsTotals({ transactions: transactionsByCategory })

    const byCategorySummary = AccountSummary.generate(
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

    byCategorySummary.setComparativePercentages(allTransactionsSummary)

    return right({
      fullTermAccountSummary: allTransactionsSummary,
      byCategorySummary,
    })
  }
}
