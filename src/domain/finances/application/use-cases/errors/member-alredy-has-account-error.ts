import { UseCaseError } from '@/core/types/errors/use-case-error'

export class MemberAlreadyHasAccountError
  extends Error
  implements UseCaseError
{
  constructor() {
    super('Member already has account')
  }
}
