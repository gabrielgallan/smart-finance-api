import { AccountSummary } from "../../enterprise/entites/account-summary"

export interface YearMonthSummary {
    period: {
        monthIndex: number
        year: number
    }
    title?: string
    summary: AccountSummary
}