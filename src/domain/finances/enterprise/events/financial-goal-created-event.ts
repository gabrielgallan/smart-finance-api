import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { DomainEvent } from "@/core/events/domain-event";
import { FinancialGoal } from "../entites/financial-goal";

export class FinancialGoalCreatedEvent implements DomainEvent {
    public ocurredAt: Date
    public financialGoal: FinancialGoal

    constructor(financialGoal: FinancialGoal) {
        this.ocurredAt = new Date()
        this.financialGoal = financialGoal
    }

    getAggregateId(): UniqueEntityID {
        return this.financialGoal.id
    }
}