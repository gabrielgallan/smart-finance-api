import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { Either, left, right } from '@/core/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { Transaction } from '@/domain/enterprise/entites/transaction'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { InvalidPeriodError } from './errors/invalid-period-error'
import dayjs from 'dayjs'

interface FetchAccountTransactionsByIntervalUseCaseRequest {
  memberId: string
  startDate: Date
  endDate: Date
}

type FetchAccountTransactionsByIntervalUseCaseResponse = Either<
  ResourceNotFoundError | MemberAccountNotFoundError | InvalidPeriodError,
  {
    transactions: Transaction[]
  }
>

export class FetchAccountTransactionsByIntervalUseCase {
  constructor(
    private membersRepository: IMembersRepository,
    private accountsRepository: IAccountsRepository,
    private transactionsRepository: ITransactionsRepository,
  ) {}

  async execute({
    memberId,
    startDate,
    endDate,
  }: FetchAccountTransactionsByIntervalUseCaseRequest): Promise<FetchAccountTransactionsByIntervalUseCaseResponse> {
    const startDateJs = dayjs(startDate)
    const endDateJs = dayjs(endDate)

    if (endDateJs.isBefore(startDateJs)) {
      return left(new InvalidPeriodError())
    }

    const member = await this.membersRepository.findById(memberId)

    if (!member) {
      return left(new ResourceNotFoundError())
    }

    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    const transactions =
      await this.transactionsRepository.findManyByAccountIdAndDatetime(
        account.id.toString(),
        {
          startDate,
          endDate,
        },
      )

    return right({
      transactions,
    })
  }
}
