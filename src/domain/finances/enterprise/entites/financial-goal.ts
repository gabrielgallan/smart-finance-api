import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface FinancialGoalProps {
  accountId: UniqueEntityID
  title: string
  description: string | null
  targetAmount: number
  currentAmount: number
  targetDate: Date
  createdAt: Date
  updatedAt: Date
}

export class FinancialGoal extends Entity<FinancialGoalProps> {
  static create(
    props: Optional<FinancialGoalProps, 'createdAt' | 'updatedAt' | 'description' | 'currentAmount'>,
    id?: UniqueEntityID,
  ) {
    const financialgoal = new FinancialGoal(
      {
        ...props,
        description: props.description ?? null,
        currentAmount: props.currentAmount ?? 0,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return financialgoal
  }

  // => Getters
  get accountId() {
    return this.props.accountId
  }

  get title() {
    return this.props.title
  }

  get description(): string | null {
    return this.props.description
  }

  get targetAmount() {
    return this.props.targetAmount
  }

  get targetDate() {
    return this.props.targetDate
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

  set targetAmount(targetAmount: number) {
    this.props.targetAmount = targetAmount

    this.touch()
  }

  set targetDate(targetDate: Date) {
    this.props.targetDate = targetDate

    this.touch()
  }

  // => Methods
  saveAmount(amount: number) {
    this.props.currentAmount += amount

    this.touch()
  }

  unsaveAmount(amount: number) {
    this.props.currentAmount -= amount

    this.touch()
  }

  touch() {
    this.props.updatedAt = new Date()
  }
}
