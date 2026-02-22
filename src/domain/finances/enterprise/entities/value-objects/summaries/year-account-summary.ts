import { ValueObject } from '@/core/entities/value-object'
import { AccountSummary } from './account-summary'

export interface YearMonthSummaryProps {
    monthIndex: number
    title?: string
    summary: AccountSummary
}

export interface YearAccountSummaryProps {
    summary: AccountSummary
    monthSummaries: YearMonthSummaryProps[]
}

export class YearAccountSummary extends ValueObject<YearAccountSummaryProps> {
    static create(
        props: YearAccountSummaryProps,
    ) {
        return new YearAccountSummary(props)
    }

    get summary() {
        return this.props.summary
    }

    get monthSummaries() {
        return this.props.monthSummaries
    }
}