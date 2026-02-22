import { ITransactionsRepository, PaginatedTransactionsQuery, TransactionsQuery } from "@/domain/finances/application/repositories/transactions-repository";
import { Transaction } from "@/domain/finances/enterprise/entities/transaction";

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
    
    async listPaginated({
        accountId, 
        categoryId, 
        interval, 
        pagination 
    }: PaginatedTransactionsQuery) {
        const { page, limit } = pagination
        const { startDate, endDate } = interval

        const transactions = this.items.filter(t => {
            return t.accountId.toString() === accountId &&
            t.createdAt.getTime() >= startDate.getTime() &&
            t.createdAt.getTime() <= endDate.getTime()
        })

        const byCategory = categoryId ? 
            transactions.filter(t => t.categoryId?.toString() === categoryId) :
            transactions

        const paginated = byCategory
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice((page - 1) * limit, page * limit)

        return paginated
    }

    async findManyByQuery({
        accountId,
        categoryId,
        interval
    }: TransactionsQuery) {
        const { startDate, endDate } = interval

        const transactions = this.items.filter(t => {
            return t.accountId.toString() === accountId &&
            t.createdAt.getTime() >= startDate.getTime() &&
            t.createdAt.getTime() <= endDate.getTime()
        })

        if (categoryId) {
            return transactions.filter(t => t.categoryId?.toString() === categoryId)
        }

        return transactions
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