import { UseCaseError } from '@/core/types/errors/use-case-error'

export class InvalidPeriodError extends Error implements UseCaseError {
  constructor() {
    super('Invalid period error')
  }
}
