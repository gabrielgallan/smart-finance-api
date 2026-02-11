import { UniqueEntityID } from '../entities/unique-entity-id'

/**
 * Represents a default interface for domain events
 * 
 * Custom events must implements this interface
 * 
 */
export interface DomainEvent {
  ocurredAt: Date
  getAggregateId(): UniqueEntityID
}