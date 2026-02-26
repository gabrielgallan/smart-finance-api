import { Body, Controller, InternalServerErrorException, NotFoundException, Post } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { Public } from '@/infra/auth/public'
import { RequestPasswordRecoverUseCase } from '@/domain/identity/application/use-cases/request-password-recover'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'

const bodySchema = z.object({
  email: z.string().email()
})

class BodyDTO extends createZodDto(bodySchema) { }

@Controller('/api')
@ApiTags('Authentication')
@Public()
export class RequestPasswordRecoverController {
  constructor(
    private requestPasswordRecover: RequestPasswordRecoverUseCase
  ) { }

  @Post('/password/recover')
  @ApiOperation({ summary: 'request password recover' })
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
