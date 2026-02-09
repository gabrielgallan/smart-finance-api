import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { CategorySummary } from '../../enterprise/entites/category-summary'

interface Test {
  summaryId: UniqueEntityID
  incomePercentage: number
  expensePercentage: number
}

export function mapCategoriesSummariesToPercentages(
  categoriesSummaries: CategorySummary[],
) {
  const totalTransactionsValues = categoriesSummaries
    .map((c) => {
      return {
        totalIncome: c.totalIncome,
        totalExpense: c.totalExpense,
      }
    })
    .reduce((at, acc) => {
      return {
        totalIncome: at.totalIncome + acc.totalIncome,
        totalExpense: at.totalExpense + acc.totalExpense,
      }
    })

  console.log(totalTransactionsValues)

  const tests: Test[] = categoriesSummaries.map((categorySummary) => {
    return {
      summaryId: categorySummary.id,
      incomePercentage:
        (categorySummary.totalIncome / totalTransactionsValues.totalIncome) *
        100,
      expensePercentage:
        (categorySummary.totalExpense / totalTransactionsValues.totalExpense) *
        100,
    }
  })

  console.log(tests)
}
