import { BadRequestException, Body, Controller, InternalServerErrorException, Post } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { AuthenticateUseCase } from '@/domain/identity/application/use-cases/authenticate'
import { InvalidCredentialsError } from '@/domain/identity/application/use-cases/errors/invalid-credentials-error'
import { Public } from '@/infra/auth/public'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string()
})

class AuthenticateBodyDTO extends createZodDto(authenticateBodySchema) { }

@Controller('/api')
@ApiTags('Authentication')
@Public()
export class AuthenticateController {
  constructor(
    private authenticate: AuthenticateUseCase
  ) { }

  @Post('/sessions')
  @ApiBody({ type: AuthenticateBodyDTO })
  @ApiOperation({ summary: 'authenticate with credentials' })
  async handle(
    @Body(new ZodValidationPipe(authenticateBodySchema)) body: AuthenticateBodyDTO
  ) {
    const { email, password } = body

    const result = await this.authenticate.execute({
      email,
      password
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case InvalidCredentialsError:
          throw new BadRequestException(error.message)

        default:
          throw new InternalServerErrorException()
      }
    }

    return {
      token: result.value.token
    }
  }
}
