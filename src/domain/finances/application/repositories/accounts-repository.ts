import { Account } from '../../enterprise/entites/account'

export interface IAccountsRepository {
  create(Account: Account): Promise<void>
  findById(id: string): Promise<Account | null>
  findByHolderId(holderId: string): Promise<Account | null>
  save(account: Account): Promise<Account>
  delete(account: Account): Promise<number>
}
