import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { AccountSummary } from "../../enterprise/entities/value-objects/summaries/account-summary";
import { Transaction } from "../../enterprise/entities/transaction";
import { DateInterval } from "@/core/types/repositories/date-interval";
import { calculateTransactionsTotals } from "../utils/calculate-transactions-totals";
import { findHighestOperationDay } from "../utils/find-highest-operation-day";

export interface AccountSummaryCalculatorInput {
    accountId: UniqueEntityID
    categoryId?: UniqueEntityID
    interval: DateInterval
    transactions: Transaction[]
}

export class AccountSummaryCalculator {
    static calculate(input: AccountSummaryCalculatorInput): AccountSummary 
    {
        const { 
            incomeTransactions,
            totalIncome,
            expenseTransactions,
            totalExpense,
         } = calculateTransactionsTotals({ transactions: input.transactions })

        return AccountSummary.generate({
            accountId: input.accountId,
            categoryId: input.categoryId,
            interval: input.interval,
            totalIncome,
            totalExpense,
            highestIncomeDay: findHighestOperationDay(incomeTransactions),
            highestExpenseDay: findHighestOperationDay(expenseTransactions),
            transactionsCount: input.transactions.length
        })
    }

    static calculateComparative(
        parentSummary: AccountSummary,
        childSummary: AccountSummary
    ) {
        childSummary.setComparativePercentages(parentSummary)

        return childSummary
    }
}