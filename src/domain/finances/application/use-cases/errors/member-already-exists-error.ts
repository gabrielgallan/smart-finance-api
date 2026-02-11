import { UseCaseError } from '@/core/types/errors/use-case-error'

export class MemberAlreadyExistsError extends Error implements UseCaseError {
  constructor() {
    super('Member already exists')
  }
}
