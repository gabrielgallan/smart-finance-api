import { ITransactionsRepository } from "@/domain/application/repositories/transactions-repository";
import { Transaction } from "@/domain/enterprise/entites/transaction";

export class InMemoryTransactionsRepository implements ITransactionsRepository {
    private items: Transaction[] = []
    
    async create(Transaction: Transaction) {
        this.items.push(Transaction)
        
        return
    }

    // findById(id: string): Promise<Transaction | null> {
    //     throw new Error("Method not implemented.");
    // }
}