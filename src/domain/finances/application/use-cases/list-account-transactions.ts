import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { Transaction } from '@/domain/finances/enterprise/entities/transaction'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { Category } from '@/domain/finances/enterprise/entities/category'
import { Pagination } from '@/core/types/repositories/pagination'
import { DateInterval } from '@/core/types/repositories/date-interval'

interface ListTransactionsFilters {
  categoryId?: string
  interval?: DateInterval
}

interface ListAccountTransactionsUseCaseRequest {
  memberId: string
  filters?: ListTransactionsFilters
  limit?: number
  page?: number
}

type ListAccountTransactionsUseCaseResponse = Either<
  | ResourceNotFoundError
  | MemberAccountNotFoundError,
  {
    transactions: Transaction[]
    interval: DateInterval
    pagination: Pagination
    category?: Category
  }
>

export class ListAccountTransactionsUseCase {
  constructor(
    private accountsRepository: IAccountsRepository,
    private transactionsRepository: ITransactionsRepository,
    private categoriesRepository: ICategoriesRepository,
  ) { }

  async execute({
    memberId,
    filters,
    limit = 10,
    page = 1,
  }: ListAccountTransactionsUseCaseRequest): Promise<ListAccountTransactionsUseCaseResponse> {
    const now = new Date()
    const oneMonthAgo = new Date(now)

    oneMonthAgo.setMonth(now.getMonth() - 1)

    const interval: DateInterval = filters?.interval ??
    {
      startDate: oneMonthAgo,
      endDate: now
    }

    const pagination: Pagination = { limit, page }

    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    let categoryId: string | undefined = undefined

    if (filters?.categoryId) {
      const category = await this.categoriesRepository.findByIdAndAccountId(
        filters.categoryId,
        account.id.toString()
      )

      if (!category) {
        return left(new ResourceNotFoundError())
      }

      categoryId = category.id.toString()
    }

    const transactions = await this.transactionsRepository.listPaginated({
      accountId: account.id.toString(),
      categoryId,
      interval,
      pagination
    })

    return right({
      transactions,
      interval,
      pagination,
    })
  }
}
