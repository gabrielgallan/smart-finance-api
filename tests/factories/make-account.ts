import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Account, AccountProps } from "@/domain/finances/enterprise/entites/account";
import { faker } from "@faker-js/faker";

export function makeAccount(
    override: Partial<AccountProps> = {},
    id?: UniqueEntityID
) {
    const account = Account.create({
        holderId: new UniqueEntityID(),
        balance: faker.number.int({ min: 0, max: 99999 }),
        ...override
    }, id)

    return account
}