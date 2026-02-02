import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Entity } from '@/core/entities/entity'
import { Optional } from '@/core/types/optional'

export interface AccountProps {
  holderId: UniqueEntityID
  balance: number
  createdAt: Date
  updatedAt?: Date
}

export class Account extends Entity<AccountProps> {
  static create(
    props: Optional<AccountProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const account = new Account(
      {
        ...props,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    )

    return account
  }

  // => Getters
  get balance() {
    return this.props.balance
  }

  get holderId() {
    return this.props.holderId
  }

  // => Setters

  // => Methods
  touch() {
    this.props.updatedAt = new Date()
  }

  deposit(value: number) {
    this.props.balance += value

    this.touch()
  }

  withdraw(value: number) {
    this.props.balance -= value

    this.touch()
  }
}
