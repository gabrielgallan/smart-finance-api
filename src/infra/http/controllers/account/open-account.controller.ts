import { Body, ConflictException, Controller, HttpCode, InternalServerErrorException, NotFoundException, Post } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { UserPayload } from '@/infra/auth/jwt.strategy'
import { OpenAccountUseCase } from '@/domain/finances/application/use-cases/open-account'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { MemberAlreadyHasAccountError } from '@/domain/finances/application/use-cases/errors/member-alredy-has-account-error'
import { ApiTags } from '@nestjs/swagger'

const openAccountBodySchema = z.object({
  initialBalance: z.coerce.number().optional()
})

type OpenAccountBodyDTO = z.infer<typeof openAccountBodySchema>

@ApiTags('Account')
@Controller('/api')
export class OpenAccountController {
  constructor(
    private openAccount: OpenAccountUseCase
  ) { }

  @Post('/accounts')
  @HttpCode(201)
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

      switch (true) {
        case error instanceof ResourceNotFoundError:
          return new NotFoundException({
            message: error.message
          })

        case error instanceof MemberAlreadyHasAccountError:
          return new ConflictException({
            message: error.message
          })

        default:
          return new InternalServerErrorException()
      }
    }

    return
  }
}
