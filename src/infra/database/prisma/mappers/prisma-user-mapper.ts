import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { User } from "@/domain/identity/enterprise/entities/user";
import { User as PrismaUser } from "@prisma/client";

export class PrismaUserMapper {
    static toDomain(raw: PrismaUser): User {
        return User.create({
            name: raw.name,
            email: raw.email,
            passwordHash: raw.passwordHash,
            avatarUrl: raw.avatarUrl,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        },
            new UniqueEntityID(raw.id)
        )
    }

    static toPrisma(user: User): PrismaUser {
        return {
            id: user.id.toString(),
            name: user.name ?? null,
            email: user.email,
            passwordHash: user.passwordHash ?? null,
            avatarUrl: user.avatarUrl ?? null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt ?? null
        }
    }
}