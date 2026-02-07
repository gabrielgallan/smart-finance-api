import { Pagination } from '@/core/repositories/pagination'
import { Transaction } from '../../enterprise/entites/transaction'
import { DateInterval } from '@/core/repositories/date-interval'

export interface ITransactionsRepository {
  create(Transaction: Transaction): Promise<void>
  findById(id: string): Promise<Transaction | null>
  listRecentByAccountId(
    accountId: string,
    pagination: Pagination,
  ): Promise<Transaction[]>
  listByIntervalAndAccountId(
    accountId: string,
    interval: DateInterval,
    pagination: Pagination,
  ): Promise<Transaction[]>
  listByIntervalAndAccountIdAndCategory(
    accountId: string,
    categoryId: string,
    interval: DateInterval,
    pagination: Pagination,
  ): Promise<Transaction[]>
  findManyByAccountIdAndInterval(
    accountId: string,
    interval: DateInterval,
  ): Promise<Transaction[]>
  findManyByAccountIdAndIntervalAndCategory(
    accountId: string,
    categoryId: string,
    interval: DateInterval,
  ): Promise<Transaction[]>
  save(transaction: Transaction): Promise<Transaction>
}
