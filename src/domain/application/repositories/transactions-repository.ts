import { Transaction } from '../../enterprise/entites/transaction'

export interface ITransactionsRepository {
  create(Transaction: Transaction): Promise<void>
  // findById(id: string): Promise<Transaction | null>
}
