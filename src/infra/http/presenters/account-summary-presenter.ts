import { AccountSummary } from "@/domain/finances/enterprise/entities/value-objects/summaries/account-summary"

export class AccountSummaryPresenter {
    static toHTTP(summary: AccountSummary) {
        return {
            categoryId: summary.categoryId?.toString() ?? null,
            interval: summary.interval,
            totals: summary.totals,
            netBalance: summary.netBalance,
            counts: summary.counts,
            percentages: summary.percentages ?? null,
        }
    }
}