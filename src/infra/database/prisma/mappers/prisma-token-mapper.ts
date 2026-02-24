import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Token } from "@/domain/identity/enterprise/entities/token";
import { Token as PrismaToken } from "@prisma/client";

export class PrismaTokenMapper {
    static toDomain(raw: PrismaToken): Token {
        return Token.create({
            userId: new UniqueEntityID(raw.userId),
            type: raw.type,
            usedAt: raw.usedAt,
            expiresAt: raw.expiresAt,
            createdAt: raw.createdAt
        },
            new UniqueEntityID(raw.id)
        )
    }

    static toPrisma(token: Token): PrismaToken {
        return {
            id: token.id.toString(),
            type: token.type,
            usedAt: token.usedAt ?? null,
            expiresAt: token.expiresAt,
            createdAt: token.createdAt,
            userId: token.userId.toString()
        }
    }
}