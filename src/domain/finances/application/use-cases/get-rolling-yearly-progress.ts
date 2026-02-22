import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import dayjs from 'dayjs'

import { getMonthDateRange } from '../utils/get-month-date-range'
import { YearAccountSummary, YearMonthSummaryProps } from '../../enterprise/entities/value-objects/summaries/year-account-summary'
import { AccountSummaryCalculator } from '../services/account-summary-calculator'

interface GetRollingYearProgressUseCaseRequest {
    memberId: string
}

type GetRollingYearProgressUseCaseResponse = Either<
    MemberAccountNotFoundError,
    {
        yearAccountSummary: YearAccountSummary
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

        const yearInterval = {
            startDate: rollingYearStartDate,
            endDate: rollingYearEndDate
        }

        const rollingYearTransactions = await this.transactionsRepository.findManyByQuery({
            accountId: account.id.toString(),
            interval: yearInterval,
        })

        const rollingYearSummary = AccountSummaryCalculator.calculate({
            accountId: account.id,
            interval: yearInterval,
            transactions: rollingYearTransactions
        })

        const rollingMonthsSummaries: YearMonthSummaryProps[] = []

        for (let c = 11; c >= 0; c--) {
            const referenceDate = dayjs().subtract(c, 'month')

            const { title, interval } = getMonthDateRange({
                date: referenceDate.toDate()
            })

            const transactionsByMonth = 
                await this.transactionsRepository.findManyByQuery({
                    accountId: account.id.toString(),
                    interval,
                })

            const monthSummary = AccountSummaryCalculator.calculate({
                accountId: account.id,
                interval,
                transactions: transactionsByMonth
            })

            monthSummary.setComparativePercentages(rollingYearSummary)

            rollingMonthsSummaries.push({
                monthIndex: referenceDate.month() + 1,
                title: title,
                summary: monthSummary
            })
        }

        const yearAccountSummary = YearAccountSummary.create({
            summary: rollingYearSummary,
            monthSummaries: rollingMonthsSummaries
        })

        return right({
            yearAccountSummary
        })
    }
}