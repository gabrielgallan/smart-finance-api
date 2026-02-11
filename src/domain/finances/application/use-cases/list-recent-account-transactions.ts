import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { Transaction } from '@/domain/finances/enterprise/entites/transaction'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { Pagination } from '@/core/types/repositories/pagination'

interface ListRecentAccountTransactionsUseCaseRequest {
  memberId: string
  limit: number
  page: number
}

type ListRecentAccountTransactionsUseCaseResponse = Either<
  ResourceNotFoundError | MemberAccountNotFoundError,
  {
    transactions: Transaction[]
    pagination: Pagination
  }
>

export class ListRecentAccountTransactionsUseCase {
  constructor(
    private membersRepository: IMembersRepository,
    private accountsRepository: IAccountsRepository,
    private transactionsRepository: ITransactionsRepository,
  ) {}

  async execute({
    memberId,
    limit = 10,
    page,
  }: ListRecentAccountTransactionsUseCaseRequest): Promise<ListRecentAccountTransactionsUseCaseResponse> {
    const member = await this.membersRepository.findById(memberId)

    if (!member) {
      return left(new ResourceNotFoundError())
    }

    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    const pagination = { limit, page }

    const transactions =
      await this.transactionsRepository.listRecentByAccountId(
        account.id.toString(),
        pagination,
      )

    return right({
      transactions,
      pagination,
    })
  }
}
