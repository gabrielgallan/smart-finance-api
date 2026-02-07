import { UseCaseError } from '@/core/errors/use-case-error'

export class MemberAlreadyHasAccountError
  extends Error
  implements UseCaseError
{
  constructor() {
    super('Member already has account')
  }
}
