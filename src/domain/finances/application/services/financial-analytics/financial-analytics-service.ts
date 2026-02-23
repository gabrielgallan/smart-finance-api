import { AccountSummaryCalculator } from "./account-summary-calculator";
import { DateInterval } from "@/core/types/repositories/date-interval";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Category } from "../../../enterprise/entities/category";
import { Transaction } from "../../../enterprise/entities/transaction";
import { AccountSummary } from "../../../enterprise/entities/value-objects/summaries/account-summary";
import { AccountSummaryComparator } from "./account-summary-comparator";

interface SummarizeByCategoriesInput {
    accountId: UniqueEntityID
    categories: Category[]
    transactions: Transaction[]
    interval: DateInterval
}

export class FinancialAnalyticsService {
  summarizeByCategories({
    accountId,
    categories,
    transactions,
    interval
  }: SummarizeByCategoriesInput) {
    const totalSummary = AccountSummaryCalculator.calculate({
      accountId,
      interval,
      transactions
    })

    const partsSummaries: AccountSummary[] = []

    for (const category of categories) {
      const transactionsByCategory = transactions.filter(t => t.categoryId?.toString() === category.id.toString())

      const categorySummary = AccountSummaryCalculator.calculate({
        accountId,
        categoryId: category.id,
        interval,
        transactions: transactionsByCategory
      })

      const percentages = AccountSummaryComparator.compare({
        totalSummary,
        partSummary: categorySummary
      })

      categorySummary.percentages = percentages

      partsSummaries.push(categorySummary)
    }

    return {
        totalSummary,
        partsSummaries
    }
  }
}