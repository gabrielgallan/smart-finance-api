import { Pagination } from '@/core/types/repositories/pagination'
import { Transaction } from '../../enterprise/entities/transaction'
import { DateInterval } from '@/core/types/repositories/date-interval'

export interface TransactionsQuery {
  accountId: string
  categoryId?: string
  interval: DateInterval
}

export interface PaginatedTransactionsQuery extends TransactionsQuery {
  pagination: Pagination
}

export abstract class ITransactionsRepository {
  abstract create(transaction: Transaction): Promise<void>
  abstract findById(id: string): Promise<Transaction | null>
  abstract listPaginated(query: PaginatedTransactionsQuery): Promise<Transaction[]>
  abstract findManyByQuery(query: TransactionsQuery): Promise<Transaction[]>
  abstract save(transaction: Transaction): Promise<Transaction>
  abstract deleteAllByAccountId(accountId: string): Promise<number>
}