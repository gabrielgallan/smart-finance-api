import { UseCaseError } from '@/core/types/errors/use-case-error'

export class InvalidMemberAgeError extends Error implements UseCaseError {
  constructor() {
    super('Member must be over 14 years old to register')
  }
}
