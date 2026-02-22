import { AccountSummary } from "../../enterprise/entities/value-objects/account-summary"

export interface YearMonthSummary {
    period: {
        monthIndex: number
        year: number
    }
    title?: string
    summary: AccountSummary
}