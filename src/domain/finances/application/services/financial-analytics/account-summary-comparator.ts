import { AccountSummary, ComparativePercentages } from "../../../enterprise/entities/value-objects/summaries/account-summary";
import { calculatePartPercentage } from "../../utils/calculate-percentage";

export interface AccountSummaryComparatorInput {
    totalSummary: AccountSummary
    partSummary: AccountSummary
}

export class AccountSummaryComparator {
    static compare({ totalSummary, partSummary }: AccountSummaryComparatorInput): ComparativePercentages 
    {
        const percentages = {
            income: calculatePartPercentage({
                totalValue: totalSummary.totals.income,
                partValue: partSummary.totals.income
            }),
            
            expense: calculatePartPercentage({
                totalValue: totalSummary.totals.expense,
                partValue: partSummary.totals.expense
            })
        }

        return percentages
    }
}