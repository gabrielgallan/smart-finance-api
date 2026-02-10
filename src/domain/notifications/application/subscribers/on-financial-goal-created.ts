import { DomainEvents } from "@/core/events/domain-events";
import { EventHandler } from "@/core/events/events-handler";
import { FinancialGoalCreatedEvent } from "@/domain/finances/enterprise/events/financial-goal-created-event";
import { SendNotificationUseCase } from "../use-cases/send-notification";
import { IMembersRepository } from "@/domain/finances/application/repositories/members-repository";

export class OnFinancialGoalCreated implements EventHandler {
    constructor(
        private sendNotificationsUseCase: SendNotificationUseCase,
        private membersRepository: IMembersRepository
    ) {
        this.setupSubscriptions()
    }

    setupSubscriptions(): void {
        DomainEvents.register(
            this.sendNotification.bind(this),
            FinancialGoalCreatedEvent.name
        )
    }
    
    private sendNotification({ financialGoal }: FinancialGoalCreatedEvent) {
    }
}