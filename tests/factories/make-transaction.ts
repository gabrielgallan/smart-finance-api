import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Transaction, TransactionOperation, TransactionProps } from "@/domain/enterprise/entites/transaction";
import { faker } from "@faker-js/faker"

export function makeTransaction(
    override: Partial<TransactionProps> = {},
    id?: UniqueEntityID
) {
    const transaction = Transaction.create({
        accountId: new UniqueEntityID(),
        categoryId: null,
        title: faker.lorem.words(2),
        description: null,
        amount: faker.number.int({ min: 1, max: 99999 }),
        operation: TransactionOperation.INCOME,
        method: null,
        ...override
    }, id)

    return transaction
}