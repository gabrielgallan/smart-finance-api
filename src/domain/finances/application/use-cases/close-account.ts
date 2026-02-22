import { IAccountsRepository } from '../repositories/accounts-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { ICategoriesRepository } from '../repositories/categories-repository'

interface CloseAccountUseCaseRequest {
  memberId: string
}

type CloseAccountUseCaseResponse = Either<
  ResourceNotFoundError,
  { rowsDeleted: number }
>

export class CloseAccountUseCase {
  constructor(
    private accountRepository: IAccountsRepository,
    private transactionsRepository: ITransactionsRepository,
    private categoriesRepository: ICategoriesRepository,
  ) {}

  async execute({
    memberId,
  }: CloseAccountUseCaseRequest): Promise<CloseAccountUseCaseResponse> {
    const account = await this.accountRepository.findByHolderId(memberId)

    if (!account) {
      return left(new ResourceNotFoundError())
    }

    const categoriesDeleted = await this.categoriesRepository.deleteAllByAccountId(account.id.toString())

    const transactionsDeleted =await this.transactionsRepository.deleteAllByAccountId(account.id.toString())

    const accountsDeleted = await this.accountRepository.delete(account)

    return right({
      rowsDeleted: categoriesDeleted + transactionsDeleted + accountsDeleted,
    })
  }
}
