import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Entity } from '@/core/entities/entity'
import { Optional } from '@/core/types/optional'
import { DateInterval } from '@/core/repositories/date-interval'
import { Category } from './category'

export interface AccountSummaryProps {
  accountId: UniqueEntityID
  totalIncome: number
  totalExpense: number
  netBalance: number
  highestIncomeDay: Date | null
  highestExpenseDay: Date | null
  transactionsCount: number
  dateInterval: DateInterval
  requestedAt: Date
}

export class AccountSummary extends Entity<AccountSummaryProps> {
  public category: Category | null

  protected constructor(
    props: AccountSummaryProps,
    category?: Category,
    id?: UniqueEntityID,
  ) {
    super(props, id)
    this.category = category ?? null
  }

  static generate(
    props: Optional<AccountSummaryProps, 'netBalance' | 'requestedAt'>,
    category?: Category,
    id?: UniqueEntityID,
  ) {
    const accountSummary = new AccountSummary(
      {
        ...props,
        netBalance: props.netBalance ?? props.totalIncome - props.totalExpense,
        requestedAt: new Date(),
      },
      category,
      id,
    )

    return accountSummary
  }

  get accountId() {
    return this.props.accountId
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
}
