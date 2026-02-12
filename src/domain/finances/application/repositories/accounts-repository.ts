import { Account } from '../../enterprise/entites/account'

export abstract class IAccountsRepository {
  abstract create(account: Account): Promise<void>
  abstract findById(id: string): Promise<Account | null>
  abstract findByHolderId(holderId: string): Promise<Account | null>
  abstract save(account: Account): Promise<Account>
  abstract delete(account: Account): Promise<number>
}