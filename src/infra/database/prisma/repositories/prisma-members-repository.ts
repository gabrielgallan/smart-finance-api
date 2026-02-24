import { IMembersRepository } from "@/domain/finances/application/repositories/members-repository";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PrismaMemberMapper } from "../mappers/prisma-member-mapper";

@Injectable()
export class PrismaMembersRepository implements IMembersRepository {
    constructor(private prisma: PrismaService) { }

    async findById(id: string) {
        const prismaUser = await this.prisma.user.findUnique({
            where: { id }
        })

        if (!prismaUser) {
            return null
        }

        return PrismaMemberMapper.toDomain(prismaUser)
    }
}