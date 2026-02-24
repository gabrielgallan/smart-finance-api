import { UseCaseError } from '@/core/types/errors/use-case-error'

export class InvalidPositiveNumberError extends Error implements UseCaseError {
  constructor() {
    super('Invalid positive number. Must be greater than 0')
  }
}