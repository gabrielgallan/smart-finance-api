import { IAccountsRepository } from '../repositories/accounts-repository'
import { IMembersRepository } from '../repositories/members-repository'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { Transaction } from '@/domain/finances/enterprise/entites/transaction'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InvalidTransactionOperationError } from './errors/invalid-transaction-operation-error'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { NotAllowedError } from '@/core/errors/not-allowed-error'

interface EditTransactionUseCaseRequest {
  memberId: string
  transactionId: string
  categoryId?: string
  title?: string
  description?: string
  method?: 'credit' | 'debit' | 'pix'
}

type EditTransactionUseCaseResponse = Either<
  | ResourceNotFoundError
  | MemberAccountNotFoundError
  | InvalidTransactionOperationError
  | NotAllowedError,
  { transaction: Transaction }
>

export class EditTransactionUseCase {
  constructor(
    private membersRepository: IMembersRepository,
    private accountsRepository: IAccountsRepository,
    private transactionsRepository: ITransactionsRepository,
    private categoriesRepository: ICategoriesRepository,
  ) {}

  async execute({
    memberId,
    transactionId,
    categoryId,
    title,
    description,
    method,
  }: EditTransactionUseCaseRequest): Promise<EditTransactionUseCaseResponse> {
    const member = await this.membersRepository.findById(memberId)

    if (!member) {
      return left(new ResourceNotFoundError())
    }

    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    const transaction =
      await this.transactionsRepository.findById(transactionId)

    if (!transaction) {
      return left(new ResourceNotFoundError())
    }

    if (transaction.accountId.toString() !== account.id.toString()) {
      return left(new NotAllowedError())
    }

    if (categoryId) {
      const category = await this.categoriesRepository.findById(categoryId)

      if (!category) {
        return left(new ResourceNotFoundError())
      }

      if (category.accountId.toString() !== account.id.toString()) {
        return left(new NotAllowedError())
      }

      transaction.categoryId = new UniqueEntityID(categoryId)
    }

    if (title) {
      transaction.title = title
    }

    if (method) {
      transaction.method = method
    }

    if (description) {
      transaction.description = description
    }

    await this.transactionsRepository.save(transaction)

    return right({
      transaction,
    })
  }
}
