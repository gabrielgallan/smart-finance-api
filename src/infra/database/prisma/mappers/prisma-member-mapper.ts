import { Member } from "@/domain/finances/enterprise/entites/member";
import { Hash } from "@/domain/finances/enterprise/entites/value-objects/hash";
import { Member as PrismaMember } from "@prisma/client"

/* eslint-disable */
export class PrismaMemberMapper {
    static toDomain(raw: PrismaMember): Member {
        return Member.create(
            {
                name: raw.name,
                birthDate: raw.birthDate,
                email: raw.email,
                password: new Hash(raw.passwordHash),
                createdAt: new Date(raw.createdAt)
            }
        )
    }

    static toPrisma(member: Member): PrismaMember {
        return {
            id: member.id.toString(),
            name: member.name,
            birthDate: member.birthDate,
            document: member.document ?? null,
            email: member.email,
            passwordHash: member.password.value,
            createdAt: member.createdAt
        }
    }
}