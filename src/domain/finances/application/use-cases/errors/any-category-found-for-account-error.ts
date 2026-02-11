import { UseCaseError } from '@/core/types/errors/use-case-error'

export class AnyCategoryFoundForAccountError
  extends Error
  implements UseCaseError
{
  constructor() {
    super('Any category was found for this account!')
  }
}
