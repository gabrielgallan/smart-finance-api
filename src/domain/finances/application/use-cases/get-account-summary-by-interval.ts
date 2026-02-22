import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import dayjs from 'dayjs'
import { InvalidPeriodError } from './errors/invalid-period-error'
import { AccountSummary } from '../../enterprise/entities/value-objects/summaries/account-summary'
import { AccountSummaryCalculator } from '../services/account-summary-calculator'


interface GetAccountSummaryByIntervalUseCaseRequest {
  memberId: string
  startDate: Date
  endDate: Date
}

type GetAccountSummaryByIntervalUseCaseResponse = Either<
  ResourceNotFoundError
  | MemberAccountNotFoundError
  | InvalidPeriodError,
  {
    currentBalance: number
    accountSummary: AccountSummary
  }
>

export class GetAccountSummaryByIntervalUseCase {
  constructor(
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

    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    const interval = { startDate, endDate }

    const transactions =
      await this.transactionsRepository.findManyByQuery({
        accountId: account.id.toString(),
        interval
      })

    const accountSummary = AccountSummaryCalculator.calculate({
      accountId: account.id,
      interval,
      transactions
    })

    return right({
      currentBalance: account.balance,
      accountSummary,
    })
  }
}
