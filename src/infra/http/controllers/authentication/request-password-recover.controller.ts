import { Body, Controller, HttpCode, InternalServerErrorException, NotFoundException, Post } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { Public } from '@/infra/auth/public'
import { RequestPasswordRecoverUseCase } from '@/domain/identity/application/use-cases/request-password-recover'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

const bodySchema = z.object({
  email: z.string().email()
})

type BodyDTO = z.infer<typeof bodySchema>

@Controller('/api')
@Public()
export class RequestPasswordRecoverController {
  constructor(
    private requestPasswordRecover: RequestPasswordRecoverUseCase
  ) { }

  @Post('/password/recover')
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(bodySchema)) body: BodyDTO
  ) {
    const { email } = body

    const result = await this.requestPasswordRecover.execute({ email })

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
