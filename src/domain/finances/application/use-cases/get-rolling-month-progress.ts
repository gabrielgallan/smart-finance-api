import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import dayjs from 'dayjs'
import { findHighestOperationDay } from '../utils/find-highest-operation-day'
import { AccountSummary } from '../../enterprise/entites/account-summary'
import { calculateTransactionsTotals } from '../utils/calculate-transactions-totals'
import { WeekMonthSummary } from '../summaries/week-month-summary'

interface GetRollingMonthProgressUseCaseRequest {
    memberId: string
}

type GetRollingMonthProgressUseCaseResponse = Either<
    MemberAccountNotFoundError,
    {
        rollingMonthSummary: AccountSummary
        rollingWeeksSummaries: WeekMonthSummary[]
    }
>

export class GetRollingMonthProgressUseCase {
    constructor(
        private accountsRepository: IAccountsRepository,
        private transactionsRepository: ITransactionsRepository,
    ) { }

    async execute({
        memberId,
    }: GetRollingMonthProgressUseCaseRequest): Promise<GetRollingMonthProgressUseCaseResponse> {
        const account = await this.accountsRepository.findByHolderId(memberId)

        if (!account) {
            return left(new MemberAccountNotFoundError())
        }

        const rollingMonthEndDate = new Date()
        const rollingMonthStartDate = new Date()

        rollingMonthStartDate.setMonth(rollingMonthEndDate.getMonth() - 1)

        const rollingMonthTransctions = await this.transactionsRepository.findManyByAccountIdAndInterval(
            account.id.toString(),
            {
                startDate: rollingMonthStartDate,
                endDate: rollingMonthEndDate
            }
        )

        const rollingMonthTransactionsTotal = calculateTransactionsTotals({ transactions: rollingMonthTransctions })

        
        const rollingMonthSummary = AccountSummary.generate(
            {
                accountId: account.id,
                dateInterval: { 
                    startDate: rollingMonthStartDate,
                    endDate: rollingMonthEndDate
                },
                totalIncome: rollingMonthTransactionsTotal.totalIncome,
                totalExpense: rollingMonthTransactionsTotal.totalExpense,
                highestIncomeDay: findHighestOperationDay(rollingMonthTransactionsTotal.incomeTransactions),
                highestExpenseDay: findHighestOperationDay(rollingMonthTransactionsTotal.expenseTransactions),
                transactionsCount: rollingMonthTransctions.length,
            }
        )
        
        const rollingWeeksSummaries: WeekMonthSummary[] = []
        
        const now = dayjs().endOf('day')

        for (let c = 3; c >= 0; c--) {
            const referenceWeekEnd = now.subtract(c * 7, 'day').endOf('day')
            const referenceWeekStart = now.subtract((c + 1) * 7, 'day').startOf('day')

            const transactionsByWeek = 
                await this.transactionsRepository.findManyByAccountIdAndInterval(
                    account.id.toString(),
                    {
                        startDate: referenceWeekStart.toDate(),
                        endDate: referenceWeekEnd.toDate(),
                    },
                )

            // => Totals
            const {
                incomeTransactions,
                expenseTransactions,
                totalIncome,
                totalExpense
            } = calculateTransactionsTotals({ transactions: transactionsByWeek })

            const weekSummary = AccountSummary.generate(
                {
                    accountId: account.id,
                    dateInterval: { 
                        startDate: referenceWeekStart.toDate(),
                        endDate: referenceWeekEnd.toDate()
                    },
                    totalIncome,
                    totalExpense,
                    highestIncomeDay: findHighestOperationDay(incomeTransactions),
                    highestExpenseDay: findHighestOperationDay(expenseTransactions),
                    transactionsCount: transactionsByWeek.length,
                }
            )

            weekSummary.setComparativePercentages(rollingMonthSummary)

            rollingWeeksSummaries.push({
                period: {
                    weekIndex: c,
                },
                summary: weekSummary
            })
        }

        return right({
            rollingMonthSummary,
            rollingWeeksSummaries,
        })
    }
}