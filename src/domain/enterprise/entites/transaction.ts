import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { TransactionMethod } from './value-objects/transaction-method'
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
  method: TransactionMethod
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
  get title() {
    return this.props.title
  }

  get amount() {
    return this.props.amount
  }

  get method() {
    return this.props.method
  }

  get categoryId() {
    return this.props.categoryId
  }

  get accountId() {
    return this.props.accountId
  }

  // => Setters
  set title(title: string) {
    this.props.title = title

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
