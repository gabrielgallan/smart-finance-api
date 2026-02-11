import { Pagination } from '@/core/types/repositories/pagination'
import { Transaction } from '../../enterprise/entites/transaction'
import { DateInterval } from '@/core/types/repositories/date-interval'

export interface ITransactionsRepository {
  create(transaction: Transaction): Promise<void>
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
  deleteAllByAccountId(accountId: string): Promise<number>
}
