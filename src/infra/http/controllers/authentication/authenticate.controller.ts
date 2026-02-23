import { Body, Controller, HttpCode, InternalServerErrorException, NotFoundException, Post, UnauthorizedException, UsePipes } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { AuthenticateMemberUseCase } from '@/domain/finances/application/use-cases/authenticate-member'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { InvalidCredentialsError } from '@/domain/finances/application/use-cases/errors/invalid-credentials-error'
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
    private authenticateMember: AuthenticateMemberUseCase
  ) { }

  @Post('/sessions')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodyDTO) {
    const { email, password } = body

    const result = await this.authenticateMember.execute({
      email, password
    })

    if (result.isLeft()) {
      const error = result.value

      switch (true) {
        case error instanceof ResourceNotFoundError:
          return new NotFoundException({
            message: error.message
          })

        case error instanceof InvalidCredentialsError:
          return new UnauthorizedException({
            message: error.message
          })

        default:
          return new InternalServerErrorException()
      }
    }

    return {
      token: result.value.token
    }
  }
}
