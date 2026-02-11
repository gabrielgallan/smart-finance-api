import { AggregateRoot } from '../entities/aggregate-root'
import { UniqueEntityID } from '../entities/unique-entity-id'
import { DomainEvent } from './domain-event'
import { DomainEvents } from './domain-events'

class CustomAggregate extends AggregateRoot<null> {
    static create() {
        const aggregate = new CustomAggregate(null)

        aggregate.addDomainEvent(new CustomAggregateCreatedEvent(aggregate))

        return aggregate
    }
}

class CustomAggregateCreatedEvent implements DomainEvent {
    public ocurredAt: Date
    public aggregate: CustomAggregate

    constructor(aggregate: CustomAggregate) {
        this.ocurredAt = new Date()
        this.aggregate = aggregate
    }

    getAggregateId(): UniqueEntityID {
        return this.aggregate.id
    }
}


describe('Domain Events tests', () => {
    it('should be able to dispatch and listen domain events', () => {
        const callbackSpy = vi.fn()

        // Register the event callback to listen the event dispatch
        DomainEvents.register(callbackSpy, CustomAggregateCreatedEvent.name)

        // Create entity instance (where the event was created)
        const aggregate = CustomAggregate.create()

        expect(aggregate.domainEvents).toHaveLength(1)
        
        // Confirm dispatch to the event created
        DomainEvents.dispatchEventsForAggregate(aggregate.id)
        
        expect(callbackSpy).toHaveBeenCalledOnce()
        expect(aggregate.domainEvents).toHaveLength(0)
    })
})