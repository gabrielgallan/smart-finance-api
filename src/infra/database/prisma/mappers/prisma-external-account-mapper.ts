import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ExternalAccount } from "@/domain/identity/enterprise/entities/external-account";
import { ExternalAccount as PrismaExternalAccount } from "@prisma/client";
import { PrismaAccountProviderMapper } from "./prisma-account-provider-mapper";

export class PrismaExternalAccountMapper {
    static toDomain(raw: PrismaExternalAccount): ExternalAccount {
        return ExternalAccount.create({
            userId: new UniqueEntityID(raw.userId),
            provider: raw.provider,
            providerUserId: raw.providerAccountId
        },
            new UniqueEntityID(raw.id)
        )
    }

    static toPrisma(externalAccount: ExternalAccount): PrismaExternalAccount {
        const prismaProvider = PrismaAccountProviderMapper.toPrisma(externalAccount.provider)

        return {
            id: externalAccount.id.toString(),
            provider: prismaProvider,
            providerAccountId: externalAccount.providerUserId ?? null,
            userId: externalAccount.userId.toString()
        }
    }
}