import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Account, AccountProps } from "@/domain/enterprise/entites/account";

export async function makeAccount(
    override: Partial<AccountProps> = {},
    id?: UniqueEntityID
) {
    const account = Account.create({
        holderId: new UniqueEntityID(),
        balance: 0,
        ...override
    }, id)

    return account
}