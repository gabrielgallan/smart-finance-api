import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { Either, left, right } from '@/core/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { Transaction } from '@/domain/enterprise/entites/transaction'
import { ITransactionsRepository } from '../repositories/transactions-repository'

interface GetAccountTransactionsUseCaseRequest {
  memberId: string
}

type GetAccountTransactionsUseCaseResponse = Either<
  ResourceNotFoundError | MemberAccountNotFoundError,
  {
    transactions: Transaction[]
  }
>

export class GetAccountTransactionsUseCase {
  constructor(
    private membersRepository: IMembersRepository,
    private accountsRepository: IAccountsRepository,
    private transactionsRepository: ITransactionsRepository,
  ) {}

  async execute({
    memberId,
  }: GetAccountTransactionsUseCaseRequest): Promise<GetAccountTransactionsUseCaseResponse> {
    const member = await this.membersRepository.findById(memberId)

    if (!member) {
      return left(new ResourceNotFoundError())
    }

    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    const transactions = await this.transactionsRepository.findManyByAccountId(
      account.id.toString(),
    )

    return right({
      transactions,
    })
  }
}
