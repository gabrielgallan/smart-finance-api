import { IAccountsRepository } from '../repositories/accounts-repository'
import { IMembersRepository } from '../repositories/members-repository'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { Either, left, right } from '@/core/either'
import { Transaction, TransactionOperation } from '@/domain/enterprise/entites/transaction'
import { MemberNotAllowedError } from './errors/member-not-allowed-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InvalidTransactionOperationError } from './errors/invalid-transaction-operation-error'
import { TransactionMethod } from '@/domain/enterprise/entites/value-objects/transaction-methods'

interface CreateTransactionUseCaseRequest {
    memberId: string
    accountId: string
    title: string
    description?: string
    amount: number
    operation: "EXPENSE" | "INCOME"
    method?: "CREDIT_CARD" | "DEBIT_CARD" | "PIX"
}

type CreateTransactionUseCaseResponse = Either<
    ResourceNotFoundError | MemberNotAllowedError,
    { transaction: Transaction }
>

export class CreateTransactionUseCase {
    constructor(
        private membersRepository: IMembersRepository,
        private accountsRepository: IAccountsRepository,
        private transactionsRepository: ITransactionsRepository,
    ) { }

    async execute({
        memberId,
        accountId,
        title,
        description,
        amount,
        operation,
        method
    }: CreateTransactionUseCaseRequest): Promise<CreateTransactionUseCaseResponse> {
        const member = await this.membersRepository.findById(memberId)

        if (!member) {
            return left(new ResourceNotFoundError())
        }

        const account = await this.accountsRepository.findById(accountId)

        if (!account) {
            return left(new ResourceNotFoundError())
        }

        if (account.holderId.toString() !== member.id.toString()) {
            return left(new MemberNotAllowedError())
        }

        let transactionOperation: TransactionOperation

        switch (operation) {
            case 'EXPENSE':
                transactionOperation = TransactionOperation.EXPENSE

                account.withdraw(amount)

                break
            case 'INCOME':
                transactionOperation = TransactionOperation.INCOME

                account.deposit(amount)

                break
            default:
                return left(new InvalidTransactionOperationError())
        }

        await this.accountsRepository.save(account)

        const transaction = Transaction.create({
            accountId: new UniqueEntityID(accountId),
            title,
            description,
            amount,
            operation: transactionOperation,
            method: TransactionMethod.from(method)
        })

        await this.transactionsRepository.create(transaction)

        return right({
            transaction,
        })
    }
}
