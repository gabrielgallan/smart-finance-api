import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { Either, left, right } from '@/core/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'

interface GetAccountSummaryUseCaseRequest {
  memberId: string
}

type GetAccountSummaryUseCaseResponse = Either<
  ResourceNotFoundError | MemberAccountNotFoundError,
  {
    balance: number
    lastUpdate: Date
  }
>

export class GetAccountSummaryUseCase {
  constructor(
    private membersRepository: IMembersRepository,
    private accountsRepository: IAccountsRepository,
  ) {}

  async execute({
    memberId,
  }: GetAccountSummaryUseCaseRequest): Promise<GetAccountSummaryUseCaseResponse> {
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
