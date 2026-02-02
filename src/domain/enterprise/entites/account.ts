import { UniqueEntityID } from "@/core/entities/unique-entity-id"
import { Entity } from "../../../core/entities/entity"
import { Optional } from "@/core/types/optional"

interface AccountProps {
    holderId: UniqueEntityID
    balance: number
    createdAt: Date
    updatedAt?: Date
}

export class Account extends Entity<AccountProps> {
    static create(
        props: Optional<AccountProps, 'createdAt'>,
        id?: UniqueEntityID
    ) {
        const account = new Account({
            ...props,
            balance: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return account
    }
}