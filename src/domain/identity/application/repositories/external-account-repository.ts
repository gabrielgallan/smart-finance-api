import { ExternalAccount } from "../../enterprise/entities/external-account";

export abstract class ExternalAccountRepository {
    abstract create(externalAccount: ExternalAccount): Promise<void>
    abstract findByProviderAndUserId(provider: string, userId: string): Promise<ExternalAccount | null>
}