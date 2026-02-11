import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { Transaction } from '@/domain/finances/enterprise/entites/transaction'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { InvalidPeriodError } from './errors/invalid-period-error'
import dayjs from 'dayjs'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { InvalidCategoryAccountRelationError } from './errors/invalid-category-account-relation-error'
import { Category } from '@/domain/finances/enterprise/entites/category'
import { Pagination } from '@/core/types/repositories/pagination'
import { DateInterval } from '@/core/types/repositories/date-interval'

interface ListAccountTransactionsByCategoryUseCaseRequest {
  memberId: string
  categoryId: string
  startDate: Date
  endDate: Date
  limit: number
  page: number
}

type ListAccountTransactionsByCategoryUseCaseResponse = Either<
  | ResourceNotFoundError
  | MemberAccountNotFoundError
  | InvalidPeriodError
  | InvalidCategoryAccountRelationError,
  {
    transactions: Transaction[]
    interval: DateInterval
    pagination: Pagination
    category: Category
  }
>

export class ListAccountTransactionsByCategoryUseCase {
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
    limit = 10,
    page,
  }: ListAccountTransactionsByCategoryUseCaseRequest): Promise<ListAccountTransactionsByCategoryUseCaseResponse> {
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

    const interval = { startDate, endDate }

    const pagination = { limit, page }

    const transactions =
      await this.transactionsRepository.listByIntervalAndAccountIdAndCategory(
        account.id.toString(),
        category.id.toString(),
        interval,
        pagination,
      )

    return right({
      transactions,
      interval,
      pagination,
      category,
    })
  }
}
