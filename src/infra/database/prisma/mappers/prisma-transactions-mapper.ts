import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Transaction } from "@/domain/finances/enterprise/entities/transaction";
import { Transaction as PrismaTransaction, Prisma } from "@prisma/client"

export class PrismaTransactionMapper {
    static toDomain(raw: PrismaTransaction): Transaction {
        return Transaction.create(
            {
                accountId: new UniqueEntityID(raw.accountId),
                categoryId: raw.categoryId ? new UniqueEntityID(raw.categoryId) : null,
                title: raw.title,
                amount: raw.amount.toNumber(),
                description: raw.description,
                operation: raw.operation,
                method: raw.method,
                createdAt: new Date(raw.createdAt),
                updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : null
            },
            new UniqueEntityID(raw.id)
        )
    }

    static toPrisma(transaction: Transaction): Prisma.TransactionUncheckedCreateInput {
        return {
            accountId: transaction.accountId.toString(),
            categoryId: transaction.categoryId?.toString(),
            title: transaction.title,
            amount: transaction.amount,
            description: transaction.description,
            operation: transaction.isIncome() ? 'income' : 'expense',
            method: transaction.method,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
        }
    }
}