import { ExternalAccountRepository } from "@/domain/identity/application/repositories/external-account-repository";
import { PrismaService } from "../prisma.service";
import { ExternalAccount } from "@/domain/identity/enterprise/entities/external-account";
import { ExternalAccountProvider } from "@prisma/client";
import { PrismaExternalAccountMapper } from "../mappers/prisma-external-account-mapper";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaExternalAccountsRepository implements ExternalAccountRepository {
    constructor(private prisma: PrismaService) { }

    async create(externalAccount: ExternalAccount) {
        const data = {
            id: externalAccount.id.toString(),
            provider: externalAccount.provider,
            providerAccountId: externalAccount.providerUserId,
            userId: externalAccount.userId.toString()
        }

        await this.prisma.externalAccount.create({
            data
        })
    }

    async findByProviderAndUserId(provider: string, userId: string) {
        let prismaProvider: ExternalAccountProvider

        switch (provider) {
            case 'GITHUB':
                prismaProvider = ExternalAccountProvider.GITHUB
                break
            default:
                throw new Error(`Invalid provider: ${provider}`)
        }

        const externalAccount = await this.prisma.externalAccount.findUnique({
            where: {
                provider_userId: {
                    provider: prismaProvider,
                    userId
                }
            }
        })

        if (!externalAccount) {
            return null
        }

        return PrismaExternalAccountMapper.toDomain(externalAccount)
    }
}