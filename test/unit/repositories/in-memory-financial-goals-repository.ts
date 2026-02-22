import { DomainEvents } from "@/core/events/domain-events";
import { IFinancialGoalsRepository } from "@/domain/finances/application/repositories/financial-goals-repository";
import { FinancialGoal } from "@/domain/finances/enterprise/entities/financial-goal";

export class InMemoryFinancialGoalsRepository implements IFinancialGoalsRepository {
    public items: FinancialGoal[] = []
    
    async create(financialGoal: FinancialGoal) {
        this.items.push(financialGoal)

        DomainEvents.dispatchEventsForAggregate(financialGoal.id)
        
        return
    }
}