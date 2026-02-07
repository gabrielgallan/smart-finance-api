import { UseCaseError } from '@/core/errors/use-case-error'

export class InvalidPeriodError extends Error implements UseCaseError {
  constructor() {
    super('Invalid period error')
  }
}
