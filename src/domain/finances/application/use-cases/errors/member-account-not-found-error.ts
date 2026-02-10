import { UseCaseError } from '@/core/types/errors/use-case-error'

export class MemberAccountNotFoundError extends Error implements UseCaseError {
  constructor() {
    super('Member does not have an open account.')
  }
}
