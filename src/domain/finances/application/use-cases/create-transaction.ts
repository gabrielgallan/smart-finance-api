import { IAccountsRepository } from '../repositories/accounts-repository'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import {
  Transaction,
  TransactionOperation,
} from '@/domain/finances/enterprise/entities/transaction'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InvalidTransactionOperationError } from './errors/invalid-transaction-operation-error'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { Injectable } from '@nestjs/common'

interface CreateTransactionUseCaseRequest {
  memberId: string
  categoryId?: string
  title: string
  description?: string
  amount: number
  operation: 'expense' | 'income'
  method?: string
}

type CreateTransactionUseCaseResponse = Either<
  | ResourceNotFoundError
  | MemberAccountNotFoundError
  | InvalidTransactionOperationError,
  { transaction: Transaction }
>

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    private accountsRepository: IAccountsRepository,
    private transactionsRepository: ITransactionsRepository,
    private categoriesRepository: ICategoriesRepository,
  ) {}

  async execute({
    memberId,
    categoryId,
    title,
    description,
    amount,
    operation,
    method,
  }: CreateTransactionUseCaseRequest): Promise<CreateTransactionUseCaseResponse> {
    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    if (categoryId) {
      const category = await this.categoriesRepository.findByIdAndAccountId(
        categoryId,
        account.id.toString()
      )

      if (!category) {
        return left(new ResourceNotFoundError())
      }
    }

    let transactionOperation: TransactionOperation

    switch (operation) {
      case 'expense':
        transactionOperation = TransactionOperation.EXPENSE

        account.withdraw(amount)

        break
      case 'income':
        transactionOperation = TransactionOperation.INCOME

        account.deposit(amount)

        break
      default:
        return left(new InvalidTransactionOperationError())
    }

    await this.accountsRepository.save(account)

    const transaction = Transaction.create({
      accountId: account.id,
      categoryId: categoryId ? new UniqueEntityID(categoryId) : undefined,
      title,
      description,
      amount,
      operation: transactionOperation,
      method,
    })

    await this.transactionsRepository.create(transaction)

    return right({
      transaction,
    })
  }
}
