import { AccountSummary } from "../../enterprise/entites/account-summary"

export interface WeekMonthSummary {
    period: {
        weekIndex: number
    }
    title?: string
    summary: AccountSummary
}