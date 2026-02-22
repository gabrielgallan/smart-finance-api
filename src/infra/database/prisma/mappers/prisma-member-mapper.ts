import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Member } from "@/domain/finances/enterprise/entities/member";
import { Member as PrismaMember, Prisma } from "@prisma/client"

export class PrismaMemberMapper {
    static toDomain(raw: PrismaMember): Member {
        return Member.create(
            {
                name: raw.name,
                document: raw.document,
                email: raw.email,
                password: raw.passwordHash,
                createdAt: new Date(raw.createdAt)
            },
            new UniqueEntityID(raw.id)
        )
    }

    static toPrisma(member: Member): Prisma.MemberUncheckedCreateInput {
        return {
            id: member.id.toString(),
            name: member.name,
            document: member.document,
            email: member.email,
            passwordHash: member.password,
            createdAt: member.createdAt
        }
    }
}