import { Pagination } from '@/core/repositories/pagination'
import { Transaction } from '../../enterprise/entites/transaction'
import { Datetime } from '@/core/repositories/datetime'

export interface ITransactionsRepository {
  create(Transaction: Transaction): Promise<void>
  findById(id: string): Promise<Transaction | null>
  findManyRecentByAccountId(
    pagination: Pagination,
    accountId: string,
  ): Promise<Transaction[]>
  findManyByIntervalAndCategory(
    accountId: string,
    datetime: Datetime,
    categoryId?: string,
  ): Promise<Transaction[]>
  save(transaction: Transaction): Promise<Transaction>
}
