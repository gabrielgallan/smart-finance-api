import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import dayjs from 'dayjs'
import { InvalidPeriodError } from './errors/invalid-period-error'
import { InvalidCategoryAccountRelationError } from './errors/invalid-category-account-relation-error'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { findHighestOperationDay } from '../utils/find-highest-operation-day'
import { CategorySummary } from '../../enterprise/entites/category-summary'
import { calculateTransactionsTotals } from '../utils/calculate-transactions-totals'
import { AccountSummary } from '../../enterprise/entites/account-summary'

interface GetAccountSummaryByCategoryUseCaseRequest {
  memberId: string
  categoryId: string
  startDate: Date
  endDate: Date
}

type GetAccountSummaryByCategoryUseCaseResponse = Either<
  | ResourceNotFoundError
  | MemberAccountNotFoundError
  | InvalidCategoryAccountRelationError,
  {
    fullTermAccountSummary: AccountSummary
    byCategorySummary: CategorySummary
  }
>

export class GetAccountSummaryByCategoryUseCase {
  constructor(
    private membersRepository: IMembersRepository,
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

    const member = await this.membersRepository.findById(memberId)

    if (!member) {
      return left(new ResourceNotFoundError())
    }

    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    const category = await this.categoriesRepository.findById(categoryId)

    if (!category) {
      return left(new ResourceNotFoundError())
    }

    if (category.accountId.toString() !== account.id.toString()) {
      return left(new InvalidCategoryAccountRelationError())
    }

    const allTransactions = await this.transactionsRepository.findManyByAccountIdAndInterval(
      account.id.toString(),
      { startDate, endDate }
    )

    const allTransactionsTotal = calculateTransactionsTotals({ transactions: allTransactions })

    const allTransactionsSummary = AccountSummary.generate(
      {
        accountId: account.id,
        dateInterval: { startDate, endDate },
        totalIncome: allTransactionsTotal.totalIncome,
        totalExpense: allTransactionsTotal.totalExpense,
        highestIncomeDay: findHighestOperationDay(allTransactionsTotal.incomeTransactions),
        highestExpenseDay: findHighestOperationDay(allTransactionsTotal.expenseTransactions),
        transactionsCount: allTransactions.length,
      }
    )

    const transactionsByCategory =
      await this.transactionsRepository.findManyByAccountIdAndIntervalAndCategory(
        account.id.toString(),
        category.id.toString(),
        {
          startDate,
          endDate,
        },
      )

    // => By Category
    const { 
      incomeTransactions,
      expenseTransactions,
      totalIncome,
      totalExpense 
    } = calculateTransactionsTotals({ transactions: transactionsByCategory })

    const byCategorySummary = CategorySummary.generate(
      {
        accountId: account.id,
        categoryId: category.id,
        dateInterval: { startDate, endDate },
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
