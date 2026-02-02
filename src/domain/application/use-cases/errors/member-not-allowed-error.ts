import { UseCaseError } from '@/core/errors/use-case-error'

export class MemberNotAllowedError extends Error implements UseCaseError {
  constructor() {
    super('Member not allowed')
  }
}
