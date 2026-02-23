import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { Category } from '@/domain/finances/enterprise/entities/category'
import { Pagination } from '@/core/types/repositories/pagination'
import { DateInterval } from '@/core/types/repositories/date-interval'
import { TransactionWithCategory } from '../../enterprise/entities/value-objects/transaction-with-category'
import { Injectable } from '@nestjs/common'

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
    transactions: TransactionWithCategory[]
    interval: DateInterval
    pagination: Pagination
  }
>

@Injectable()
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

    let category: Category | null = null

    if (filters?.categoryId) {
      category = await this.categoriesRepository.findByIdAndAccountId(
        filters.categoryId,
        account.id.toString()
      )

      if (!category) {
        return left(new ResourceNotFoundError())
      }
    }

    const transactions = await this.transactionsRepository.listPaginated({
      accountId: account.id.toString(),
      categoryId: category ? category.id.toString() : undefined,
      interval,
      pagination
    })

    const details = transactions.map(transaction => {
      return TransactionWithCategory.create({
        title: transaction.title,
        amount: transaction.amount,
        operation: transaction.operation,
        method: transaction.method,
        category: category ? {
          name: category.name,
          slug: category.slug.value
        } : null,
        createdAt: transaction.createdAt
      })
    })

    return right({
      transactions: details,
      interval,
      pagination,
    })
  }
}
