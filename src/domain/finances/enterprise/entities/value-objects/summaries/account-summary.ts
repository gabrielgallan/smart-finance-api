import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DateInterval } from '@/core/types/repositories/date-interval'
import { ValueObject } from '@/core/entities/value-object'

export interface AccountSummaryProps {
    accountId: UniqueEntityID
    categoryId?: UniqueEntityID // -> classify the summary category
    interval: DateInterval
    totals: {
        income: number,
        expense: number
    }
    counts: {
        transactions: number
    }
    
    netBalance: number
    percentages?: ComparativePercentages
}

export interface ComparativePercentages {
    income: number
    expense: number
}

export class AccountSummary extends ValueObject<AccountSummaryProps> {
    static generate(
        props: AccountSummaryProps,
    ) {
        return new AccountSummary(props)
    }

    // => Getters
    get accountId() {
        return this.props.accountId
    }

    get categoryId() {
        return this.props.categoryId
    }

    get interval() {
        return this.props.interval
    }

    get totals() {
        return this.props.totals
    }

    get counts() {
        return this.props.counts
    }

    get netBalance() {
        return this.props.netBalance
    }

    get percentages() {
        return this.props.percentages
    }

    set percentages(percentages: ComparativePercentages | undefined) {
        this.props.percentages = percentages
    }
}