import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import dayjs from 'dayjs'
import { InvalidPeriodError } from './errors/invalid-period-error'
import { findHighestOperationDay } from '../utils/find-highest-operation-day'
import { AccountSummary } from '../../enterprise/entities/value-objects/account-summary'


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

    const transactions =
      await this.transactionsRepository.findManyByQuery({
        accountId: account.id.toString(),
        interval: {
          startDate,
          endDate,
        }
      })

    // => Income
    const incomeTransactions = transactions.filter((t) => t.isIncome())

    const totalIncome = incomeTransactions
      .map((t) => t.amount)
      .reduce((at, acc) => at + acc, 0)

    // => Expenses
    const expenseTransactions = transactions.filter((t) => t.isExpense())

    const totalExpense = expenseTransactions
      .map((t) => t.amount)
      .reduce((at, acc) => at + acc, 0)

    const accountSummary = AccountSummary.generate({
      accountId: account.id,
      interval: { startDate, endDate },
      totalIncome,
      totalExpense,
      highestIncomeDay: findHighestOperationDay(incomeTransactions),
      highestExpenseDay: findHighestOperationDay(expenseTransactions),
      transactionsCount: transactions.length,
    })

    return right({
      currentBalance: account.balance,
      accountSummary,
    })
  }
}
