import { DateInterval } from "@/core/repositories/date-interval";
import { Pagination } from "@/core/repositories/pagination";
import { ITransactionsRepository } from "@/domain/application/repositories/transactions-repository";
import { Transaction } from "@/domain/enterprise/entites/transaction";

export class InMemoryTransactionsRepository implements ITransactionsRepository {
    public items: Transaction[] = []
    
    async create(Transaction: Transaction) {
        this.items.push(Transaction)
        
        return
    }
    
    async findById(id: string): Promise<Transaction | null> {
        const transaction = this.items.find(t => t.id.toString() === id)
        
        return transaction ?? null
    }
    
    async findManyRecentByAccountId({ page }: Pagination, accountId: string) {
        const transactions = this.items
        .filter(t => t.accountId.toString() === accountId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice((page - 1) * 10, page * 10)
        
        return transactions
    }
    
    async findManyByAccountIdAndInterval(
        accountId: string, 
        { startDate, endDate }: DateInterval
    ) {
        const transactionsByInterval = this.items.filter((t) => {
            return  t.accountId.toString() === accountId &&
                t.createdAt.getTime() >= startDate.getTime() &&
                t.createdAt.getTime() <= endDate.getTime()
        })

        return transactionsByInterval
    }

    async findManyByAccountIdAndIntervalAndCategory(
        accountId: string, 
        catedoryId: string,
        { startDate, endDate }: DateInterval,
    ) {
        const transactionsByInterval = this.items.filter((t) => {
            return  t.accountId.toString() === accountId &&
                t.createdAt.getTime() >= startDate.getTime() &&
                t.createdAt.getTime() <= endDate.getTime()
        })

        return catedoryId ? transactionsByInterval.filter(t => t.categoryId?.toString() === catedoryId) : transactionsByInterval
    }

    async save(transaction: Transaction) {
        const transactionIndex = this.items.findIndex(t => t.id.toString() === transaction.id.toString())

        if (transactionIndex >= 0) {
            this.items[transactionIndex] = transaction
        }

        return transaction
    }
}