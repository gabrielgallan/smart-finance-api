import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

interface ExternalAccountProps {
    userId: UniqueEntityID
    provider: string
    providerUserId?: string | null
}

export class ExternalAccount extends Entity<ExternalAccountProps> {
    static create(
        props: ExternalAccountProps,
        id?: UniqueEntityID,
    ) {
        const externalAccount = new ExternalAccount(
            props,
            id
        )

        return externalAccount
    }

    get userId() {
        return this.props.userId
    }

    get provider() {
        return this.props.provider
    }

    get providerUserId() {
        return this.props.providerUserId
    }
}