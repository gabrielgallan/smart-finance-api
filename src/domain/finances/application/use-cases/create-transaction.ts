import { IAccountsRepository } from '../repositories/accounts-repository'
import { IMembersRepository } from '../repositories/members-repository'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import {
  Transaction,
  TransactionOperation,
} from '@/domain/finances/enterprise/entites/transaction'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InvalidTransactionOperationError } from './errors/invalid-transaction-operation-error'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { InvalidCategoryAccountRelationError } from './errors/invalid-category-account-relation-error'

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
  | InvalidCategoryAccountRelationError
  | InvalidTransactionOperationError,
  { transaction: Transaction }
>

export class CreateTransactionUseCase {
  constructor(
    private membersRepository: IMembersRepository,
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
    const member = await this.membersRepository.findById(memberId)

    if (!member) {
      return left(new ResourceNotFoundError())
    }

    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    if (categoryId) {
      const category = await this.categoriesRepository.findById(categoryId)

      if (!category) {
        return left(new ResourceNotFoundError())
      }

      if (category.accountId.toString() !== account.id.toString()) {
        return left(new InvalidCategoryAccountRelationError())
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
