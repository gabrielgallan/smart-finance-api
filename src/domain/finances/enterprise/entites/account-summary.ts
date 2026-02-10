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
  requestedAt: Date
}

export interface Percentages {
  incomePercentage: number
  expensePercentage: number
}

export class AccountSummary extends Entity<AccountSummaryProps> {
  private _percentages?: Percentages

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
    return this._percentages
  }


  // Methods
  private calculatePercentages(totalSummary: AccountSummary): Percentages {
    return {
      incomePercentage: calculatePartPercentage({
        totalValue: totalSummary.totalIncome,
        partValue: this.props.totalIncome
      }),
      expensePercentage: calculatePartPercentage({
        totalValue: totalSummary.totalExpense,
        partValue: this.props.totalExpense
      })
    }
  }

  public setPercentages(totalSummary: AccountSummary) {
    const percentages = this.calculatePercentages(totalSummary)
    
    this._percentages = percentages
  }
}