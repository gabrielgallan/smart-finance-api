import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Transaction, TransactionOperation, TransactionProps } from "@/domain/enterprise/entites/transaction";
import { TransactionMethod } from "@/domain/enterprise/entites/value-objects/transaction-method";

export async function makeTransaction(
    override: Partial<TransactionProps> = {},
    id?: UniqueEntityID
) {
    const transaction = Transaction.create({
        accountId: new UniqueEntityID(),
        title: 'Generic transaction',
        amount: 0,
        operation: TransactionOperation.INCOME,
        method: TransactionMethod.credit(),
        ...override
    }, id)

    return transaction
}