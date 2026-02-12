import { IAccountsRepository } from "@/domain/finances/application/repositories/accounts-repository";
import { Account } from "@/domain/finances/enterprise/entites/account";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PrismaAccountMapper } from "../mappers/prisma-account-mapper";

/* eslint-disable */
@Injectable()
export class PrismaAccountsRepository implements IAccountsRepository {
    constructor(private prisma: PrismaService) { }

    async create(account: Account): Promise<void> {
        const prismaAccount = await this.prisma.account.create({
            data: PrismaAccountMapper.toPrisma(account)
        })

        return
    }

    async findById(id: string) {
        const prismaAccount = await this.prisma.account.findUnique({
            where: { id }
        })

        if (!prismaAccount) {
            return null
        }

        return PrismaAccountMapper.toDomain(prismaAccount)
    }

    async findByHolderId(holderId: string) {
        const prismaAccount = await this.prisma.account.findUnique({
            where: { holderId }
        })

        if (!prismaAccount) {
            return null
        }

        return PrismaAccountMapper.toDomain(prismaAccount)
    }

    async save(account: Account) {
        const data = PrismaAccountMapper.toPrisma(account)

        const updated = await this.prisma.account.update({
            where: { id: account.id.toString() },
            data
        })

        return PrismaAccountMapper.toDomain(updated)
    }

    async delete(account: Account) {
        const rows = await this.prisma.account.delete({
            where: {
                id: account.id.toString()
            }
        })

        return 1
    }

}