import { Body, ConflictException, Controller, InternalServerErrorException, NotFoundException, Post } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { UserPayload } from '@/infra/auth/jwt.strategy'
import { OpenAccountUseCase } from '@/domain/finances/application/use-cases/open-account'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { MemberAlreadyHasAccountError } from '@/domain/finances/application/use-cases/errors/member-alredy-has-account-error'
import { ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'

const openAccountBodySchema = z.object({
  initialBalance: z.coerce.number().optional()
})

class OpenAccountBodyDTO extends createZodDto(openAccountBodySchema) {}

@ApiTags('Account')
@Controller('/api')
export class OpenAccountController {
  constructor(
    private openAccount: OpenAccountUseCase
  ) { }

  @Post('/accounts')
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(openAccountBodySchema)) body: OpenAccountBodyDTO
  ) {
    const { initialBalance } = body

    const result = await this.openAccount.execute({
      memberId: user.sub,
      initialBalance
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)

        case MemberAlreadyHasAccountError:
          throw new ConflictException(error.message)

        default:
          return new InternalServerErrorException()
      }
    }

    return
  }
}
