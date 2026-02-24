import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Member } from "@/domain/finances/enterprise/entities/member";
import { User as PrismaUser } from "@prisma/client";

export class PrismaMemberMapper {
    static toDomain(raw: PrismaUser): Member {
        return Member.create({},
            new UniqueEntityID(raw.id)
        )
    }
}