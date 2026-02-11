import { UseCaseError } from '@/core/types/errors/use-case-error'

export class NotAllowedError extends Error implements UseCaseError {
  constructor() {
    super('Not allowed error')
  }
}