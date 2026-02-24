import { BadRequestException, Body, Controller, HttpCode, InternalServerErrorException, NotFoundException, Put } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { Public } from '@/infra/auth/public'
import { ResetPasswordUseCase } from '@/domain/identity/application/use-cases/reset-password'
import { InvalidTokenError } from '@/domain/identity/application/use-cases/errors/invalid-token-error'

const bodySchema = z.object({
  code: z.string(),
  password: z.string().min(6)
})

type BodyDTO = z.infer<typeof bodySchema>

@Controller('/api')
@Public()
export class ResetPasswordController {
  constructor(
    private resetPassword: ResetPasswordUseCase,
  ) { }

  @Put('/profile/password')
  @HttpCode(204)
  async handle(
    @Body(new ZodValidationPipe(bodySchema)) body: BodyDTO
  ) {
    const { code, password } = body

    const result = await this.resetPassword.execute({
      recoverCode: code,
      password
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)

        case InvalidTokenError:
          throw new BadRequestException(error.message)

        default:
          throw new InternalServerErrorException()
      }
    }

    return
  }
}
