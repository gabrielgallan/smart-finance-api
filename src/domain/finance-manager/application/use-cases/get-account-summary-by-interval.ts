import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { Either, left, right } from '@/core/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import dayjs from 'dayjs'
import { InvalidPeriodError } from './errors/invalid-period-error'
import { AccountSummary } from '@/domain/finance-manager/enterprise/entites/account-summary'

interface GetAccountSummaryByIntervalUseCaseRequest {
  memberId: string
  startDate: Date
  endDate: Date
}

type GetAccountSummaryByIntervalUseCaseResponse = Either<
  ResourceNotFoundError | MemberAccountNotFoundError,
  {
    currentBalance: number
    accountSummary: AccountSummary
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
      await this.transactionsRepository.findManyByAccountIdAndInterval(
        account.id.toString(),
        {
          startDate,
          endDate,
        },
      )

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

    const accountSummary = AccountSummary.create({
      accountId: account.id,
      totalIncome,
      totalExpense,
      transactionsCount: transactions.length,
    })

    return right({
      currentBalance: account.balance,
      accountSummary,
    })
  }
}
