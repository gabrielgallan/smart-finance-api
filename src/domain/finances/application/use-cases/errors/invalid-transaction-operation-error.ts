import { UseCaseError } from '@/core/types/errors/use-case-error'

export class InvalidTransactionOperationError
  extends Error
  implements UseCaseError
{
  constructor() {
    super('Invalid transaction operation. Must be EXPENSE or INCOME')
  }
}
