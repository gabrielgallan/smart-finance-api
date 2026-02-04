import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { Either, left, right } from '@/core/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'

interface FetchAccountSummaryUseCaseRequest {
  memberId: string
}

type FetchAccountSummaryUseCaseResponse = Either<
  ResourceNotFoundError | MemberAccountNotFoundError,
  {
    balance: number
    lastUpdate: Date
  }
>

export class FetchAccountSummaryUseCase {
  constructor(
    private membersRepository: IMembersRepository,
    private accountsRepository: IAccountsRepository,
  ) {}

  async execute({
    memberId,
  }: FetchAccountSummaryUseCaseRequest): Promise<FetchAccountSummaryUseCaseResponse> {
    const member = await this.membersRepository.findById(memberId)

    if (!member) {
      return left(new ResourceNotFoundError())
    }

    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    return right({
      balance: account.balance,
      lastUpdate: account.updatedAt,
    })
  }
}
