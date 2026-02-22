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

export interface ITransactionsRepository {
   create(transaction: Transaction): Promise<void>
   findById(id: string): Promise<Transaction | null>
   listPaginated(query: PaginatedTransactionsQuery): Promise<Transaction[]>
   findManyByQuery(query: TransactionsQuery): Promise<Transaction[]>
   save(transaction: Transaction): Promise<Transaction>
   deleteAllByAccountId(accountId: string): Promise<number>
}