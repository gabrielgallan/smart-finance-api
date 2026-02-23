import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { AccountSummary } from "@/domain/finances/enterprise/entities/value-objects/summaries/account-summary"; 
import { Transaction } from "@/domain/finances/enterprise/entities/transaction"; 
import { DateInterval } from "@/core/types/repositories/date-interval";
import { calculateTransactionsTotals } from "../../utils/calculate-transactions-totals"; 

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
            totalIncome,
            totalExpense,
         } = calculateTransactionsTotals({ transactions: input.transactions })

        return AccountSummary.generate({
            accountId: input.accountId,
            categoryId: input.categoryId,
            interval: input.interval,
            totals: {
                income: totalIncome,
                expense: totalExpense
            },
            counts: {
                transactions: input.transactions.length
            },
            netBalance: totalIncome - totalExpense
        })
    }
}