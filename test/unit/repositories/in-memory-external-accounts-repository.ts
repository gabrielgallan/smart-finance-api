import { ExternalAccountRepository } from "@/domain/identity/application/repositories/external-account-repository";
import { ExternalAccount, Provider } from "@/domain/identity/enterprise/entities/external-account";

export class InMemoryExternalAccountsRepository implements ExternalAccountRepository {
    public items: ExternalAccount[] = []

    async create(externalAccount: ExternalAccount) {
        this.items.push(externalAccount)

        return
    }

    async findByProviderAndUserId(
        provider: Provider,
        userId: string
    ) {
        const externalAccount = this.items.find(item => {
            return item.provider === provider && item.userId.toString() === userId
        })

        return externalAccount ?? null
    }
}