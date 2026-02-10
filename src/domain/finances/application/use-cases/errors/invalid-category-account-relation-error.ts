import { UseCaseError } from '@/core/types/errors/use-case-error'

export class InvalidCategoryAccountRelationError
  extends Error
  implements UseCaseError
{
  constructor() {
    super('Category received belongs to another account.')
  }
}
