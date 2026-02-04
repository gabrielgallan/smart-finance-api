import { ITransactionsRepository } from "@/domain/application/repositories/transactions-repository";
import { Transaction } from "@/domain/enterprise/entites/transaction";

export class InMemoryTransactionsRepository implements ITransactionsRepository {
    private items: Transaction[] = []
    
    async create(Transaction: Transaction) {
        this.items.push(Transaction)
        
        return
    }

    async findById(id: string): Promise<Transaction | null> {
        const transaction = this.items.find(t => t.id.toString() === id)

        return transaction ?? null
    }

    async findManyByAccountId(accountId: string) {
        const transactions = this.items.filter(t => t.accountId.toString() === accountId)

        return transactions
    }
}