import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { Either, left, right } from '@/core/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import dayjs from 'dayjs'
import { InvalidPeriodError } from './errors/invalid-period-error'

interface GetAccountSummaryByIntervalUseCaseRequest {
  memberId: string
  startDate: Date
  endDate: Date
}

type GetAccountSummaryByIntervalUseCaseResponse = Either<
  ResourceNotFoundError | MemberAccountNotFoundError,
  {
    currentBalance: number
    periodNetBalance: number
    totalIncome: number
    totalExpense: number
    transactionsCount: number
  }
>

export class GetAccountSummaryByIntervalUseCase {
  constructor(
    private membersRepository: IMembersRepository,
    private accountsRepository: IAccountsRepository,
    private transactionsRepository: ITransactionsRepository,
  ) {}

  async execute({
    memberId,
    startDate,
    endDate,
  }: GetAccountSummaryByIntervalUseCaseRequest): Promise<GetAccountSummaryByIntervalUseCaseResponse> {
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

    const totalIncome = transactions
      .filter((t) => t.isIncome())
      .map((t) => t.amount)
      .reduce((at, acc) => at + acc, 0)

    const totalExpense = transactions
      .filter((t) => t.isExpense())
      .map((t) => t.amount)
      .reduce((at, acc) => at + acc, 0)

    return right({
      currentBalance: account.balance,
      periodNetBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      transactionsCount: transactions.length,
    })
  }
}
