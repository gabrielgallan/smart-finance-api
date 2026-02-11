import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Entity } from '@/core/entities/entity'
import { Optional } from '@/core/types/optional'
import { DateInterval } from '@/core/types/repositories/date-interval'
import { calculatePartPercentage } from '../../application/utils/calculate-percentage'

export interface AccountSummaryProps {
  accountId: UniqueEntityID
  categoryId?: UniqueEntityID
  totalIncome: number
  totalExpense: number
  netBalance: number
  highestIncomeDay: Date | null
  highestExpenseDay: Date | null
  transactionsCount: number
  dateInterval: DateInterval
  comparativePercentages?: ComparativePercentages
  requestedAt: Date
}

export interface ComparativePercentages {
  totalIncomePercentage: number
  totalExpensePercentage: number
}

export class AccountSummary extends Entity<AccountSummaryProps> {
  static generate(
    props: Optional<AccountSummaryProps, 'netBalance' | 'requestedAt' | 'categoryId'>,
    id?: UniqueEntityID,
  ) {
    const accountSummary = new AccountSummary(
      {
        ...props,
        netBalance: props.netBalance ?? props.totalIncome - props.totalExpense,
        requestedAt: new Date(),
      },
      id,
    )

    return accountSummary
  }

  // => Getters
  get accountId() {
    return this.props.accountId
  }

  get categoryId() {
    return this.props.categoryId
  }

  get totalIncome() {
    return this.props.totalIncome
  }

  get totalExpense() {
    return this.props.totalExpense
  }

  get netBalance() {
    return this.props.netBalance
  }

  get highestIncomeDay() {
    return this.props.highestIncomeDay
  }

  get highestExpenseDay() {
    return this.props.highestExpenseDay
  }

  get transactionsCount() {
    return this.props.transactionsCount
  }

  get percentages() {
    return this.props.comparativePercentages
  }


  // Methods
  private calculateComparativePercentages(summary: AccountSummary): ComparativePercentages {
    return {
      totalIncomePercentage: calculatePartPercentage({
        totalValue: summary.totalIncome,
        partValue: this.props.totalIncome
      }),
      totalExpensePercentage: calculatePartPercentage({
        totalValue: summary.totalExpense,
        partValue: this.props.totalExpense
      })
    }
  }

  public setComparativePercentages(toCompareSummary: AccountSummary) {
    const percentages = this.calculateComparativePercentages(toCompareSummary)
    
    this.props.comparativePercentages = percentages
  }
}