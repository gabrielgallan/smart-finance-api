import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { DateInterval } from '@/core/types/repositories/date-interval'
import { calculatePartPercentage } from '@/domain/finances/application/utils/calculate-percentage'
import { ValueObject } from '@/core/entities/value-object'

export interface AccountSummaryProps {
    accountId: UniqueEntityID
    categoryId?: UniqueEntityID // -> classify the summary category

    // -> Totals
    totalIncome: number
    totalExpense: number
    netBalance: number

    // -> Days
    highestIncomeDay: Date | null
    highestExpenseDay: Date | null

    // -> Counts
    transactionsCount: number

    // -> Dates
    interval: DateInterval
    requestedAt: Date

    // -> Comparatives to another summary
    comparativePercentages?: ComparativePercentages
}

export interface ComparativePercentages {
    totalIncomePercentage: number
    totalExpensePercentage: number
}

export class AccountSummary extends ValueObject<AccountSummaryProps> {
    static generate(
        props: Optional<AccountSummaryProps, 'netBalance' | 'requestedAt'>,
    ) {
        const accountSummary = new AccountSummary(
            {
                ...props,
                netBalance: props.netBalance ?? props.totalIncome - props.totalExpense,
                requestedAt: new Date(),
            },
        )

        return accountSummary
    }

    // => Getters
    get accountId() {
        return this.props.accountId
    }

    get categoryId() {
        return this.props.categoryId
    }

    get totalIncome() {
        return this.props.totalIncome
    }

    get totalExpense() {
        return this.props.totalExpense
    }

    get netBalance() {
        return this.props.netBalance
    }

    get highestIncomeDay() {
        return this.props.highestIncomeDay
    }

    get highestExpenseDay() {
        return this.props.highestExpenseDay
    }

    get transactionsCount() {
        return this.props.transactionsCount
    }

    get percentages() {
        return this.props.comparativePercentages
    }

    // Methods
    public setComparativePercentages(summaryToCompare: AccountSummary) {
        const percentages = {
            totalIncomePercentage: calculatePartPercentage({
                totalValue: summaryToCompare.totalIncome,
                partValue: this.props.totalIncome
            }),
            
            totalExpensePercentage: calculatePartPercentage({
                totalValue: summaryToCompare.totalExpense,
                partValue: this.props.totalExpense
            })
        }

        this.props.comparativePercentages = percentages
    }
}