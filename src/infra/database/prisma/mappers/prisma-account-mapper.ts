import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Account } from "@/domain/finances/enterprise/entites/account";
import { Account as PrismaAccount, Prisma } from "@prisma/client"

export class PrismaAccountMapper {
    static toDomain(raw: PrismaAccount): Account {
        return Account.create(
            {
                holderId: new UniqueEntityID(raw.holderId),
                balance: raw.balance.toNumber(),
                createdAt: new Date(raw.createdAt),
                updatedAt: raw.updatedAt
            },
            new UniqueEntityID(raw.id)
        )
    }

    static toPrisma(account: Account): Prisma.AccountUncheckedCreateInput {
        return {
            id: account.id.toString(),
            holderId: account.holderId.toString(),
            balance: account.balance,
            createdAt: account.createdAt
        }
    }
}