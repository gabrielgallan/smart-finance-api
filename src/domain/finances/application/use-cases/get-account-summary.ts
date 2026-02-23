import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import dayjs from 'dayjs'
import { InvalidPeriodError } from './errors/invalid-period-error'
import { AccountSummary } from '../../enterprise/entities/value-objects/summaries/account-summary'
import { AccountSummaryCalculator } from '../services/financial-analytics/account-summary-calculator'
import { Injectable } from '@nestjs/common'
import { DateInterval } from '@/core/types/repositories/date-interval'


interface GetAccountSummaryUseCaseRequest {
  memberId: string
  interval: DateInterval
}

type GetAccountSummaryUseCaseResponse = Either<
  | MemberAccountNotFoundError
  | InvalidPeriodError,
  {
    summary: AccountSummary
  }
>

@Injectable()
export class GetAccountSummaryUseCase {
  constructor(
    private accountsRepository: IAccountsRepository,
    private transactionsRepository: ITransactionsRepository,
  ) {}

  async execute({
    memberId,
    interval
  }: GetAccountSummaryUseCaseRequest): Promise<GetAccountSummaryUseCaseResponse> {
    const startDateJs = dayjs(interval.startDate)
    const endDateJs = dayjs(interval.endDate)

    if (endDateJs.isBefore(startDateJs)) {
      return left(new InvalidPeriodError())
    }

    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    const transactions =
      await this.transactionsRepository.findManyByQuery({
        accountId: account.id.toString(),
        interval
      })

    const summary = AccountSummaryCalculator.calculate({
      accountId: account.id,
      interval,
      transactions
    })

    return right({
      summary,
    })
  }
}
