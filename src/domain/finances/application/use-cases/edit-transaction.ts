import { IAccountsRepository } from '../repositories/accounts-repository'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { Transaction } from '@/domain/finances/enterprise/entities/transaction'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { Injectable } from '@nestjs/common'

interface EditTransactionUseCaseRequest {
  memberId: string
  transactionId: string
  categoryId?: string
  title?: string
  description?: string
  method?: string
}

type EditTransactionUseCaseResponse = Either<
  | ResourceNotFoundError
  | MemberAccountNotFoundError
  | NotAllowedError,
  { transaction: Transaction }
>

@Injectable()
export class EditTransactionUseCase {
  constructor(
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
      const category = await this.categoriesRepository.findByIdAndAccountId(
        categoryId,
        account.id.toString()
      )

      if (!category) {
        return left(new ResourceNotFoundError())
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
