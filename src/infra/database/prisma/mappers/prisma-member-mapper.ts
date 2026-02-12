import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Member } from "@/domain/finances/enterprise/entites/member";
import { Hash } from "@/domain/finances/enterprise/entites/value-objects/hash";
import { Member as PrismaMember, Prisma } from "@prisma/client"

export class PrismaMemberMapper {
    static toDomain(raw: PrismaMember): Member {
        return Member.create(
            {
                name: raw.name,
                birthDate: raw.birthDate,
                document: raw.document,
                email: raw.email,
                password: new Hash(raw.passwordHash),
                createdAt: new Date(raw.createdAt)
            },
            new UniqueEntityID(raw.id)
        )
    }

    static toPrisma(member: Member): Prisma.MemberUncheckedCreateInput {
        return {
            id: member.id.toString(),
            name: member.name,
            birthDate: member.birthDate,
            document: member.document,
            email: member.email,
            passwordHash: member.password.value,
            createdAt: member.createdAt
        }
    }
}