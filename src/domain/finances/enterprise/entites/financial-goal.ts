import { AggregateRoot } from '@/core/entities/aggregate-root'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { FinancialGoalCreatedEvent } from '../events/financial-goal-created-event'

export interface FinancialGoalProps {
  accountId: UniqueEntityID
  title: string
  description?: string | null
  targetAmount: number
  savedAmount: number
  targetDate: Date
  createdAt: Date
  updatedAt?: Date | null
}

export class FinancialGoal extends AggregateRoot<FinancialGoalProps> {
  static create(
    props: Optional<FinancialGoalProps, 'createdAt' | 'updatedAt' | 'savedAmount'>,
    id?: UniqueEntityID,
  ) {
    const financialGoal = new FinancialGoal(
      {
        ...props,
        savedAmount: props.savedAmount ?? 0,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    )

    const isNew = !id

    if (isNew) {
      financialGoal.addDomainEvent(new FinancialGoalCreatedEvent(financialGoal))
    }

    return financialGoal
  }

  // => Getters
  get accountId() {
    return this.props.accountId
  }

  get title() {
    return this.props.title
  }

  get description() {
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

  set description(description: string | undefined | null) {
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
    this.props.savedAmount += amount

    this.touch()
  }

  unsaveAmount(amount: number) {
    this.props.savedAmount -= amount

    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }
}
