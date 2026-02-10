import { UseCaseError } from '@/core/types/errors/use-case-error'

export class CategoryAlreadyExistsError extends Error implements UseCaseError {
  constructor() {
    super('Another category with same name already exists in this acocunt')
  }
}
