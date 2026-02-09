import type { AggregateRoot } from '../entities/aggregate-root';
import type { UniqueEntityID } from '../entities/unique-entity-id'; 
import type { DomainEvent } from '../events/domain-event';

// biome-ignore lint:
type DomainEventCallback = (event: any) => void;

//Function do manage pub/sub

// biome-ignore lint:
export class DomainEvents {
  private static handlersMap: Record<string, DomainEventCallback[]> = {}; //subscribers
  // biome-ignore lint:
  private static markedAggregates: AggregateRoot<any>[] = []; // how many aggregates have events to dispatch not ready to be dispatched
  // biome-ignore lint:
  public static markAggregateForDispatch(aggregate: AggregateRoot<any>) {
    // biome-ignore lint:
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id);

    if (!aggregateFound) {
      // biome-ignore lint:
      this.markedAggregates.push(aggregate);
    }
  }
  // biome-ignore lint:
  private static dispatchAggregateEvents(aggregate: AggregateRoot<any>) {
    //dispatch all events from an aggregate
    // biome-ignore lint:
    aggregate.domainEvents.forEach((event: DomainEvent) =>
      // biome-ignore lint:
      this.dispatch(event),
    );
  }

  private static removeAggregateFromMarkedDispatchList(
    // biome-ignore lint:
    aggregate: AggregateRoot<any>,
  ) {
    // biome-ignore lint:
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate));
    // biome-ignore lint:
    this.markedAggregates.splice(index, 1);
  }

  private static findMarkedAggregateByID(
    id: UniqueEntityId,
    // biome-ignore lint:
  ): AggregateRoot<any> | undefined {
    // biome-ignore lint:
    return this.markedAggregates.find((aggregate) => aggregate.id.equals(id));
  }

  public static dispatchEventsForAggregate(id: UniqueEntityId) {
    // biome-ignore lint:
    const aggregate = this.findMarkedAggregateByID(id);

    if (aggregate) {
      // biome-ignore lint:
      this.dispatchAggregateEvents(aggregate);
      aggregate.clearEvents();
      // biome-ignore lint:
      this.removeAggregateFromMarkedDispatchList(aggregate);
    }
  }

  public static register(
    callback: DomainEventCallback,
    eventClassName: string,
  ) {
    // biome-ignore lint:
    const wasEventRegisteredBefore = eventClassName in this.handlersMap;

    if (!wasEventRegisteredBefore) {
      // biome-ignore lint:
      this.handlersMap[eventClassName] = [];
    }

    // biome-ignore lint:
    this.handlersMap[eventClassName].push(callback);
  }

  public static clearHandlers() {
    // biome-ignore lint:
    this.handlersMap = {};
  }

  public static clearMarkedAggregates() {
    // biome-ignore lint:
    this.markedAggregates = [];
  }

  public static async dispatchAllEvents() {
    // biome-ignore lint:
    for (const aggregate of this.markedAggregates) {
      // biome-ignore lint:
      this.dispatchAggregateEvents(aggregate);
      aggregate.clearEvents();
    }
    // biome-ignore lint:
    this.clearMarkedAggregates();
  }

  private static dispatch(event: DomainEvent) {
    const eventClassName: string = event.constructor.name;
    // biome-ignore lint:
    const isEventRegistered = eventClassName in this.handlersMap;

    if (isEventRegistered) {
      // biome-ignore lint:
      const handlers = this.handlersMap[eventClassName];

      for (const handler of handlers) {
        handler(event);
      }
    }
  }
}