import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { Either, left, right } from '@/core/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import dayjs from 'dayjs'
import { InvalidPeriodError } from './errors/invalid-period-error'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { AnyCategoryFoundForAccountError } from './errors/any-category-found-for-account-error'
import { findHighestOperationDay } from '../utils/find-highest-operation-day'
import { AccountSummary } from '../../enterprise/entites/account-summary'
import { CategorySummary } from '../../enterprise/entites/category-summary'

interface GetAccountSummariesByCategoriesUseCaseRequest {
  memberId: string
  startDate: Date
  endDate: Date
}

type GetAccountSummariesByCategoriesUseCaseResponse = Either<
  | ResourceNotFoundError
  | MemberAccountNotFoundError
  | AnyCategoryFoundForAccountError,
  {
    currentBalance: number
    categoriesSummaries: CategorySummary[]
  }
>

export class GetAccountSummariesByCategoriesUseCase {
  constructor(
    private membersRepository: IMembersRepository,
    private accountsRepository: IAccountsRepository,
    private transactionsRepository: ITransactionsRepository,
    private categoriesRepository: ICategoriesRepository,
  ) {}

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

    const member = await this.membersRepository.findById(memberId)

    if (!member) {
      return left(new ResourceNotFoundError())
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

    const categoriesSummaries: AccountSummary[] = []

    for (const category of categories) {
      const transactions =
        await this.transactionsRepository.findManyByAccountIdAndIntervalAndCategory(
          account.id.toString(),
          category.id.toString(),
          {
            startDate,
            endDate,
          },
        )

      // => Income
      const incomeTransactions = transactions.filter((t) => t.isIncome())

      const totalIncome = incomeTransactions
        .map((t) => t.amount)
        .reduce((at, acc) => at + acc, 0)

      // => Expenses
      const expenseTransactions = transactions.filter((t) => t.isExpense())

      const totalExpense = expenseTransactions
        .map((t) => t.amount)
        .reduce((at, acc) => at + acc, 0)

      const categorySummary = CategorySummary.generate(
        {
          accountId: account.id,
          dateInterval: { startDate, endDate },
          totalIncome,
          totalExpense,
          highestIncomeDay: findHighestOperationDay(incomeTransactions),
          highestExpenseDay: findHighestOperationDay(expenseTransactions),
          transactionsCount: transactions.length,
        },
        category,
      )

      categoriesSummaries.push(categorySummary)
    }

    return right({
      currentBalance: account.balance,
      categoriesSummaries,
    })
  }
}
