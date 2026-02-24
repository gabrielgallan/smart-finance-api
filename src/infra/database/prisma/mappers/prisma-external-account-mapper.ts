import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ExternalAccount, Provider } from "@/domain/identity/enterprise/entities/external-account";
import { ExternalAccount as PrismaExternalAccount } from "@prisma/client";

export class PrismaExternalAccountMapper {
    static toDomain(raw: PrismaExternalAccount): ExternalAccount {
        return ExternalAccount.create({
            userId: new UniqueEntityID(raw.userId),
            provider: Provider.GITHUB,
            providerUserId: raw.providerAccountId
        },
            new UniqueEntityID(raw.id)
        )
    }

    static toPrisma(externalAccount: ExternalAccount): PrismaExternalAccount {
        return {
            id: externalAccount.id.toString(),
            provider: externalAccount.provider,
            providerAccountId: externalAccount.providerUserId ?? null,
            userId: externalAccount.userId.toString()
        }
    }
}