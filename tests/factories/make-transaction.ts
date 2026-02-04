import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Transaction, TransactionOperation, TransactionProps } from "@/domain/enterprise/entites/transaction";
import { TransactionMethod } from "@/domain/enterprise/entites/value-objects/transaction-method";
import { faker } from "@faker-js/faker"

export function makeTransaction(
    override: Partial<TransactionProps> = {},
    id?: UniqueEntityID
) {
    const transaction = Transaction.create({
        accountId: new UniqueEntityID(),
        title: faker.lorem.words(2),
        amount: faker.number.int({ min: 1, max: 99999 }),
        operation: TransactionOperation.INCOME,
        method: TransactionMethod.credit(),
        ...override
    }, id)

    return transaction
}