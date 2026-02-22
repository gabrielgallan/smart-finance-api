import { ITransactionsRepository, PaginatedTransactionsQuery, TransactionsQuery } from "@/domain/finances/application/repositories/transactions-repository";
import { Transaction } from "@/domain/finances/enterprise/entities/transaction";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PrismaTransactionMapper } from "../mappers/prisma-transactions-mapper";


@Injectable()
export class PrismaTransactionsRepository implements ITransactionsRepository {
    constructor(private prisma: PrismaService) { }

    async create(transaction: Transaction) {
        await this.prisma.transaction.create({
            data: PrismaTransactionMapper.toPrisma(transaction)
        })

        return
    }

    async findById(id: string) {
        const transaction = await this.prisma.transaction.findUnique({
            where: {
                id
            }
        })

        if (!transaction) {
            return null
        }

        return PrismaTransactionMapper.toDomain(transaction)
    }

    async listPaginated({ 
        accountId, 
        categoryId, 
        interval, 
        pagination 
    }: PaginatedTransactionsQuery) {
        const transactions = await this.prisma.transaction.findMany({
            where: {
                accountId,
                categoryId,
                createdAt: {
                    gte: interval.startDate,
                    lte: interval.endDate
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: (pagination.page - 1) * pagination.limit,
            take: pagination.limit
        })

        // eslint-disable-next-line @typescript-eslint/unbound-method
        return transactions.map(PrismaTransactionMapper.toDomain)
    }

    async findManyByQuery({
        accountId,
        categoryId,
        interval
    }: TransactionsQuery) {
        const transactions = await this.prisma.transaction.findMany({
            where: {
                accountId,
                categoryId,
                createdAt: {
                    gte: interval.startDate,
                    lte: interval.endDate
                }
            }
        })

        // eslint-disable-next-line @typescript-eslint/unbound-method
        return transactions.map(PrismaTransactionMapper.toDomain)
    }

    async save(transaction: Transaction) {
        const updated = await this.prisma.transaction.update({
            where: { id: transaction.id.toString() },
            data: PrismaTransactionMapper.toPrisma(transaction)
        })

        return PrismaTransactionMapper.toDomain(updated)
    }

    async deleteAllByAccountId(accountId: string) {
        const result = await this.prisma.transaction.deleteMany({
            where: {
                accountId
            }
        })

        return result.count
    }
}