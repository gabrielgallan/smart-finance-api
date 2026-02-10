import { DateInterval } from "@/core/types/repositories/date-interval";
import { Pagination } from "@/core/types/repositories/pagination";
import { ITransactionsRepository } from "@/domain/finances/application/repositories/transactions-repository";
import { Transaction } from "@/domain/finances/enterprise/entites/transaction";

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
    
    async listRecentByAccountId(accountId: string, { limit, page }: Pagination) {
        const transactions = this.items
            .filter(t => t.accountId.toString() === accountId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice((page - 1) * limit, page * limit)
        
        return transactions
    }

    async listByIntervalAndAccountId(
        accountId: string,
        { startDate, endDate }: DateInterval,
        { limit, page }: Pagination
    ) {
        const transactionsByInterval = this.items.filter((t) => {
            return  t.accountId.toString() === accountId &&
                t.createdAt.getTime() >= startDate.getTime() &&
                t.createdAt.getTime() <= endDate.getTime()
        })

        const transactionsPagineted = transactionsByInterval
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice((page - 1) * limit, page * limit)
        
        return transactionsPagineted
    }

    async listByIntervalAndAccountIdAndCategory(
        accountId: string,
        catedoryId: string,
        { startDate, endDate }: DateInterval,
        { limit, page }: Pagination
    ) {
        const transactionsByIntervalAndCategory = this.items.filter((t) => {
            return  t.accountId.toString() === accountId &&
                t.categoryId?.toString() === catedoryId &&
                t.createdAt.getTime() >= startDate.getTime() &&
                t.createdAt.getTime() <= endDate.getTime()
        })

        const transactionsPagineted = transactionsByIntervalAndCategory
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice((page - 1) * limit, page * limit)
        
        return transactionsPagineted
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
        const transactionsByIntervalAndCategory = this.items.filter((t) => {
            return  t.accountId.toString() === accountId &&
                t.categoryId?.toString() === catedoryId &&
                t.createdAt.getTime() >= startDate.getTime() &&
                t.createdAt.getTime() <= endDate.getTime()
        })

        return transactionsByIntervalAndCategory
    }

    async save(transaction: Transaction) {
        const transactionIndex = this.items.findIndex(t => t.id.toString() === transaction.id.toString())

        if (transactionIndex >= 0) {
            this.items[transactionIndex] = transaction
        }

        return transaction
    }

    async deleteAllByAccountId(accountId: string) {
        const originalLenght = this.items.length

        const remaining = this.items.filter(a => a.accountId.toString() !== accountId)

        this.items = remaining

        return originalLenght - remaining.length
    }
}