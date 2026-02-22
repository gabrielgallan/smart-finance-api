import { IAccountsRepository } from "@/domain/finances/application/repositories/accounts-repository";
import { Account } from "@/domain/finances/enterprise/entities/account";

export class InMemoryAccountsRepository implements IAccountsRepository {
    public items: Account[] = []
    
    async create(account: Account) {
        this.items.push(account)
        return
    }
    
    async findByHolderId(holderId: string): Promise<Account | null> {
        const account = this.items.find((a) => a.holderId.toString() === holderId)
        
        return account ?? null
    }
    
    async findById(id: string) {
        const account = this.items.find((a) => a.id.toString() === id)
        
        return account ?? null
    }
    
    async save(account: Account) {
        const accountIndex = this.items.findIndex(a => a.id.toString() === account.id.toString())
        
        if (accountIndex >= 0) {
            this.items[accountIndex] = account
        }
        
        return account
    }

    async delete(account: Account) {
        const accountIndex = this.items.findIndex(a => a.id.toString() === account.id.toString())

        this.items.splice(accountIndex, 1)

        return 1
    }
}