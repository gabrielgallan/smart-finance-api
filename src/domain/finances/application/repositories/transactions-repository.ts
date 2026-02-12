import { Pagination } from '@/core/types/repositories/pagination'
import { Transaction } from '../../enterprise/entites/transaction'
import { DateInterval } from '@/core/types/repositories/date-interval'

export abstract class ITransactionsRepository {
  abstract create(transaction: Transaction): Promise<void>
  abstract findById(id: string): Promise<Transaction | null>
  abstract listRecentByAccountId(
    accountId: string,
    pagination: Pagination,
  ): Promise<Transaction[]>
  abstract listByIntervalAndAccountId(
    accountId: string,
    interval: DateInterval,
    pagination: Pagination,
  ): Promise<Transaction[]>
  abstract listByIntervalAndAccountIdAndCategory(
    accountId: string,
    categoryId: string,
    interval: DateInterval,
    pagination: Pagination,
  ): Promise<Transaction[]>
  abstract findManyByAccountIdAndInterval(
    accountId: string,
    interval: DateInterval,
  ): Promise<Transaction[]>
  abstract findManyByAccountIdAndIntervalAndCategory(
    accountId: string,
    categoryId: string,
    interval: DateInterval,
  ): Promise<Transaction[]>
  abstract save(transaction: Transaction): Promise<Transaction>
  abstract deleteAllByAccountId(accountId: string): Promise<number>
}
