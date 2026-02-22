import { IMembersRepository } from "@/domain/finances/application/repositories/members-repository";
import { Member } from "@/domain/finances/enterprise/entities/member";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PrismaMemberMapper } from "../mappers/prisma-member-mapper";

@Injectable()
export class PrismaMembersRepository implements IMembersRepository {
    constructor(private prisma: PrismaService) {}

    async create(member: Member) {
        const data = PrismaMemberMapper.toPrisma(member)

        await this.prisma.member.create({
            data,
        })

        return
    }

    async findById(id: string) {
        const prismaMember = await this.prisma.member.findUnique({
            where: { id }
        })

        if (!prismaMember) {
            return null
        }

        return PrismaMemberMapper.toDomain(prismaMember)
    }

    async findByDocument(document: string) {
        const prismaMember = await this.prisma.member.findFirst({
            where: { document }
        })

        if (!prismaMember) {
            return null
        }

        return PrismaMemberMapper.toDomain(prismaMember)
    }

    async findByEmail(email: string) {
        const prismaMember = await this.prisma.member.findFirst({
            where: { email }
        })

        if (!prismaMember) {
            return null
        }

        return PrismaMemberMapper.toDomain(prismaMember)
    }
    
    async save(member: Member) {
        const data = PrismaMemberMapper.toPrisma(member)

        const updated = await this.prisma.member.update({
            where: { id: member.id.toString() },
            data
        })

        return PrismaMemberMapper.toDomain(updated)
    }
}