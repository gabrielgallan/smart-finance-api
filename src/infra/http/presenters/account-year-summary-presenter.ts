import { YearAccountSummary } from "@/domain/finances/enterprise/entities/value-objects/summaries/year-account-summary"

export class AccountYearSummaryPresenter {
    static toHTTP(summary: YearAccountSummary) {
        return {
            year: {
                interval: summary.summary.interval,
                totals: summary.summary.totals,
                netBalance: summary.summary.netBalance,
                counts: summary.summary.counts,
            },
            months: summary.monthSummaries.map(m => {
                return {
                    monthIndex: m.monthIndex,
                    summary: {
                        totals: m.summary.totals,
                        netBalance: m.summary.netBalance,
                        counts: m.summary.counts,
                        percentages: m.summary.percentages
                    }
                }
            })
        }
    }
}