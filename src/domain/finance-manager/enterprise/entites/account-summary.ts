import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Entity } from '@/core/entities/entity'
import { Optional } from '@/core/types/optional'

export interface AccountSummaryProps {
  accountId: UniqueEntityID
  categoryId: UniqueEntityID | null
  totalIncome: number
  totalExpense: number
  netBalance: number
  transactionsCount: number
  requestedAt: Date
}

export class AccountSummary extends Entity<AccountSummaryProps> {
  static create(
    props: Optional<
      AccountSummaryProps,
      'requestedAt' | 'netBalance' | 'categoryId'
    >,
    id?: UniqueEntityID,
  ) {
    const accountSummary = new AccountSummary(
      {
        ...props,
        categoryId: props.categoryId ?? null,
        netBalance: props.netBalance ?? props.totalIncome - props.totalExpense,
        requestedAt: props.requestedAt ?? new Date(),
      },
      id,
    )

    return accountSummary
  }

  // => Getters
  get totalIncome() {
    return this.props.totalIncome
  }

  get totalExpense() {
    return this.props.totalExpense
  }

  get netBalance() {
    return this.props.netBalance
  }

  get transactionsCount() {
    return this.props.transactionsCount
  }

  get requestedAt() {
    return this.props.requestedAt
  }

  // => Setters
  // => Methods
}
