import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import dayjs from 'dayjs'
import { findHighestOperationDay } from '../utils/find-highest-operation-day'

import { calculateTransactionsTotals } from '../utils/calculate-transactions-totals'
import { getMonthDateRange } from '../utils/get-month-date-range'
import { YearMonthSummary } from '../summaries/year-month-summary'
import { AccountSummary } from '../../enterprise/entities/value-objects/account-summary'

interface GetRollingYearProgressUseCaseRequest {
    memberId: string
}

type GetRollingYearProgressUseCaseResponse = Either<
    MemberAccountNotFoundError,
    {
        rollingYearSummary: AccountSummary
        rollingMonthsSummaries: YearMonthSummary[]
    }
>

export class GetRollingYearProgressUseCase {
    constructor(
        private accountsRepository: IAccountsRepository,
        private transactionsRepository: ITransactionsRepository,
    ) { }

    async execute({
        memberId,
    }: GetRollingYearProgressUseCaseRequest): Promise<GetRollingYearProgressUseCaseResponse> {
        const account = await this.accountsRepository.findByHolderId(memberId)

        if (!account) {
            return left(new MemberAccountNotFoundError())
        }

        const rollingYearEndDate = new Date()
        const rollingYearStartDate = new Date()

        rollingYearStartDate.setFullYear(rollingYearEndDate.getFullYear() - 1)

        const rollingYearTransactions = await this.transactionsRepository.findManyByQuery({
            accountId: account.id.toString(),
            interval: {
                startDate: rollingYearStartDate,
                endDate: rollingYearEndDate
            }
        })

        const rollingYearTransactionsTotals = calculateTransactionsTotals({ transactions: rollingYearTransactions })

        const rollingYearSummary = AccountSummary.generate(
            {
                accountId: account.id,
                interval: { 
                    startDate: rollingYearStartDate,
                    endDate: rollingYearEndDate
                },
                totalIncome: rollingYearTransactionsTotals.totalIncome,
                totalExpense: rollingYearTransactionsTotals.totalExpense,
                highestIncomeDay: findHighestOperationDay(rollingYearTransactionsTotals.incomeTransactions),
                highestExpenseDay: findHighestOperationDay(rollingYearTransactionsTotals.expenseTransactions),
                transactionsCount: rollingYearTransactions.length,
            }
        )

        const rollingMonthsSummaries: YearMonthSummary[] = []

        for (let c = 11; c >= 0; c--) {
            const referenceDate = dayjs().subtract(c, 'month')

            const { title, start, end } = getMonthDateRange({
                date: referenceDate.toDate()
            })

            const transactionsByMonth = 
                await this.transactionsRepository.findManyByQuery({
                    accountId: account.id.toString(),
                    interval: {
                        startDate: start,
                        endDate: end,
                    },
                })

            // => Totals
            const {
                incomeTransactions,
                expenseTransactions,
                totalIncome,
                totalExpense
            } = calculateTransactionsTotals({ transactions: transactionsByMonth })

            const monthSummary = AccountSummary.generate(
                {
                    accountId: account.id,
                    interval: { 
                        startDate: start,
                        endDate: end
                    },
                    totalIncome,
                    totalExpense,
                    highestIncomeDay: findHighestOperationDay(incomeTransactions),
                    highestExpenseDay: findHighestOperationDay(expenseTransactions),
                    transactionsCount: transactionsByMonth.length,
                }
            )

            monthSummary.setComparativePercentages(rollingYearSummary)

            rollingMonthsSummaries.push({
                period: {
                    monthIndex: referenceDate.month() + 1,
                    year: referenceDate.year()
                },
                title: title,
                summary: monthSummary
            })
        }

        return right({
            rollingYearSummary,
            rollingMonthsSummaries,
        })
    }
}