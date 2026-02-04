import { Pagination } from '@/core/repositories/pagination'
import { Transaction } from '../../enterprise/entites/transaction'

export interface ITransactionsRepository {
  create(Transaction: Transaction): Promise<void>
  findById(id: string): Promise<Transaction | null>
  findManyRecentByAccountId(
    pagination: Pagination,
    accountId: string,
  ): Promise<Transaction[]>
  save(transaction: Transaction): Promise<Transaction>
}
