import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { TransactionMethod } from './value-objects/transaction-methods'

export enum TransactionOperation {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

interface TransactionProps {
  accountId: UniqueEntityID
  title: string
  amount: number
  description?: string
  operation: TransactionOperation
  method: TransactionMethod
  createdAt: Date
  updatedAt?: Date
}

export class Transaction extends Entity<TransactionProps> {
  static create(
    props: Optional<TransactionProps, 'createdAt'>,
    id?: UniqueEntityID
  ) {
    const transaction = new Transaction({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date()
    }, id)

    return transaction
  }

  // => Getters
  get amount() {
    return this.props.amount
  }

  get method() {
    return this.props.method
  }

  // => Setters
  set title(title: string) {
    this.props.title = title

    this.touch()
  }

  set description(description: string) {
    this.props.description = description

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
