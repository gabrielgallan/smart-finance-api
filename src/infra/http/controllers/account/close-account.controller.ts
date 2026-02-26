import { Controller, Delete, HttpCode, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { UserPayload } from '@/infra/auth/jwt.strategy'
import { CloseAccountUseCase } from '@/domain/finances/application/use-cases/close-account'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Account')
@Controller('/api')
export class CloseAccountController {
  constructor(
    private closeAccount: CloseAccountUseCase
  ) { }

  @Delete('/accounts')
  @HttpCode(204)
  async handle(
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.closeAccount.execute({
      memberId: user.sub,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)

        default:
          throw new InternalServerErrorException()
      }
    }

    return
  }
}
