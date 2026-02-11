import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { AggregateRoot } from '@/core/entities/aggregate-root'

export enum TransactionOperation {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface TransactionProps {
  accountId: UniqueEntityID
  categoryId?: UniqueEntityID
  title: string
  amount: number
  description?: string
  operation: TransactionOperation
  method?: string
  createdAt: Date
  updatedAt: Date
}

export class Transaction extends AggregateRoot<TransactionProps> {
  static create(
    props: Optional<TransactionProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    const transaction = new Transaction(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return transaction
  }

  // => Getters
  get accountId() {
    return this.props.accountId
  }

  get categoryId(): UniqueEntityID | undefined {
    return this.props.categoryId
  }

  get title() {
    return this.props.title
  }

  get description(): string | undefined {
    return this.props.description
  }

  get amount() {
    return this.props.amount
  }

  get method(): string | undefined {
    return this.props.method
  }

  get createdAt() {
    return this.props.createdAt
  }

  // => Setters
  set title(title: string) {
    this.props.title = title

    this.touch()
  }

  set categoryId(categoryId: UniqueEntityID | undefined) {
    this.props.categoryId = categoryId

    this.touch()
  }

  set description(description: string | undefined) {
    this.props.description = description

    this.touch()
  }

  set method(method: string | undefined) {
    this.props.method = method

    this.touch()
  }

  // => Methods
  touch() {
    this.props.updatedAt = new Date()
  }

  isIncome() {
    return this.props.operation === TransactionOperation.INCOME
  }

  isExpense() {
    return this.props.operation === TransactionOperation.EXPENSE
  }
}
