import { IMembersRepository } from '../repositories/members-repository'
import { Account } from '@/domain/finances/enterprise/entites/account'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { MemberAlreadyHasAccountError } from './errors/member-alredy-has-account-error'
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
    private membersRepository: IMembersRepository,
    private accountRepository: IAccountsRepository,
    private transactionsRepository: ITransactionsRepository,
    private categoriesRepository: ICategoriesRepository,
  ) {}

  async execute({
    memberId,
  }: CloseAccountUseCaseRequest): Promise<CloseAccountUseCaseResponse> {
    const member = await this.membersRepository.findById(memberId)

    if (!member) {
      return left(new ResourceNotFoundError())
    }

    const memberAccount = await this.accountRepository.findByHolderId(memberId)

    if (!memberAccount) {
      return left(new ResourceNotFoundError())
    }

    const categoriesDeleted = await this.categoriesRepository.deleteAllByAccountId(memberAccount.id.toString())

    const transactionsDeleted =await this.transactionsRepository.deleteAllByAccountId(memberAccount.id.toString())

    const accountsDeleted = await this.accountRepository.delete(memberAccount)

    member.accountId = undefined

    await this.membersRepository.save(member)

    return right({
      rowsDeleted: categoriesDeleted + transactionsDeleted + accountsDeleted,
    })
  }
}
