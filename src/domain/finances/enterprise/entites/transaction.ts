import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { AggregateRoot } from '@/core/entities/aggregate-root'

export enum TransactionOperation {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface TransactionProps {
  accountId: UniqueEntityID
  categoryId?: UniqueEntityID | null
  title: string
  amount: number
  description?: string | null
  operation: TransactionOperation
  method?: string | null
  createdAt: Date
  updatedAt?: Date | null
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
        updatedAt: props.updatedAt ?? null,
      },
      id,
    )

    return transaction
  }

  // => Getters
  get accountId() {
    return this.props.accountId
  }

  get categoryId() {
    return this.props.categoryId
  }

  get title() {
    return this.props.title
  }

  get description() {
    return this.props.description
  }

  get amount() {
    return this.props.amount
  }

  get method() {
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

  set categoryId(categoryId: UniqueEntityID | undefined | null) {
    this.props.categoryId = categoryId

    this.touch()
  }

  set description(description: string | undefined | null) {
    this.props.description = description

    this.touch()
  }

  set method(method: string | undefined | null) {
    this.props.method = method

    this.touch() 
  }

  // => Methods
  private touch() {
    this.props.updatedAt = new Date()
  }

  public isIncome() {
    return this.props.operation === TransactionOperation.INCOME
  }

  public isExpense() {
    return this.props.operation === TransactionOperation.EXPENSE
  }
}
