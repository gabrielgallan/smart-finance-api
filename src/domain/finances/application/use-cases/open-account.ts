import { IMembersRepository } from '../repositories/members-repository'
import { Account } from '@/domain/finances/enterprise/entites/account'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { MemberAlreadyHasAccountError } from './errors/member-alredy-has-account-error'
import { Either, left, right } from '@/core/types/either'
import { Injectable } from '@nestjs/common'

interface OpenAccountUseCaseRequest {
  memberId: string
  initialBalance?: number
}

type OpenAccountUseCaseResponse = Either<
  ResourceNotFoundError | MemberAlreadyHasAccountError,
  { account: Account }
>

@Injectable()
export class OpenAccountUseCase {
  constructor(
    private membersRepository: IMembersRepository,
    private accountRepository: IAccountsRepository,
  ) {}

  async execute({
    memberId,
    initialBalance,
  }: OpenAccountUseCaseRequest): Promise<OpenAccountUseCaseResponse> {
    const member = await this.membersRepository.findById(memberId)

    if (!member) {
      return left(new ResourceNotFoundError())
    }

    const memberAccount = await this.accountRepository.findByHolderId(memberId)

    if (memberAccount) {
      return left(new MemberAlreadyHasAccountError())
    }

    const account = Account.create({
      holderId: member.id,
      balance: initialBalance ?? 0,
    })

    await this.accountRepository.create(account)

    return right({
      account,
    })
  }
}
