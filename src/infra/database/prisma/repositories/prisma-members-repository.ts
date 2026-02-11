import { IMembersRepository } from "@/domain/finances/application/repositories/members-repository";
import { Member } from "@/domain/finances/enterprise/entites/member";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PrismaMemberMapper } from "../mappers/prisma-member-mapper";

/* eslint-disable */
@Injectable()
export class PrismaMembersRepository implements IMembersRepository {
    constructor(private prisma: PrismaService) {}

    async create(member: Member) {
        const prismaMember = await this.prisma.member.create({
            data: {
                id: member.id.toString(),
                birthDate: member.birthDate,
                name: member.name,
                email: member.email,
                passwordHash: member.password.value,
            }
        })

        return
    }

    async findById(id: string) {
        const prismaMember = await this.prisma.member.findUnique({
            where: {
                id
            }
        })

        if (!prismaMember) {
            return null
        }

        return PrismaMemberMapper.toDomain(prismaMember)
    }

    async findByDocument(document: string) {
        const prismaMember = await this.prisma.member.findFirst({
            where: {
                document
            }
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

    async findByAccountId(accountId: string) {
        const prismaMember = await this.prisma.member.findFirst({
            where: { account: {
                id: accountId
            } }
        })

        if (!prismaMember) {
            return null
        }

        return PrismaMemberMapper.toDomain(prismaMember)
    }
    
    async save(member: Member) {
        const prismaMember = PrismaMemberMapper.toPrisma(member)

        const updated = await this.prisma.member.update({
            where: { id: member.id.toString() },
            data: prismaMember
        })

        return PrismaMemberMapper.toDomain(updated)
    }
}