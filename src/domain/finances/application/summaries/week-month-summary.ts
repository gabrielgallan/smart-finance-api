import { AccountSummary } from "../../enterprise/entities/value-objects/account-summary"

export interface WeekMonthSummary {
    period: {
        weekIndex: number
    }
    title?: string
    summary: AccountSummary
}