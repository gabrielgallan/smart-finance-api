import { BadRequestException, Body, Controller, HttpCode, InternalServerErrorException, Post } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { AuthenticateUseCase } from '@/domain/identity/application/use-cases/authenticate'
import { InvalidCredentialsError } from '@/domain/identity/application/use-cases/errors/invalid-credentials-error'
import { Public } from '@/infra/auth/public'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string()
})

type AuthenticateBodyDTO = z.infer<typeof authenticateBodySchema>

@Controller('/api')
@Public()
export class AuthenticateController {
  constructor(
    private authenticate: AuthenticateUseCase
  ) { }

  @Post('/sessions')
  @HttpCode(201)
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
