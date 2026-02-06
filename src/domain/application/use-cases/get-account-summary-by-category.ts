import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { Either, left, right } from '@/core/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import dayjs from 'dayjs'
import { InvalidPeriodError } from './errors/invalid-period-error'
import { AccountSummary } from '@/domain/enterprise/entites/account-summary'
import { Category } from '@/domain/enterprise/entites/category'
import { InvalidCategoryAccountRelationError } from './errors/invalid-category-account-relation-error'
import { ICategoriesRepository } from '../repositories/categories-repository'

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
    currentBalance: number
    accountSummaryByCategory: {
      accountSummary: AccountSummary
      category: Category
    }
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

    const accountSummary = AccountSummary.create({
      accountId: account.id,
      totalIncome,
      totalExpense,
      transactionsCount: transactions.length,
    })

    return right({
      currentBalance: account.balance,
      accountSummaryByCategory: {
        accountSummary,
        category,
      },
    })
  }
}
