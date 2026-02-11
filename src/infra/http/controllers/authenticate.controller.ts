import { Body, Controller, HttpCode, InternalServerErrorException, NotFoundException, Post, UnauthorizedException, UsePipes } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import z from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { AuthenticateMemberUseCase } from '@/domain/finances/application/use-cases/authenticate-member'
import { PrismaMembersRepository } from '@/infra/database/prisma/repositories/prisma-members-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { InvalidCredentialsError } from '@/domain/finances/application/use-cases/errors/invalid-credentials-error'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string()
})

type AuthenticateBodyDTO = z.infer<typeof authenticateBodySchema>

@Controller('/api')
export class AuthenticateController {
  constructor(
    private jwt: JwtService,
    private membersRepository: PrismaMembersRepository
  ) { }

  @Post('/sessions')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodyDTO) {
    const { email, password } = body

    const authenticateMemberUseCase = new AuthenticateMemberUseCase(
      this.membersRepository
    )

    const result = await authenticateMemberUseCase.execute({
      email, password
    })

    if (result.isLeft()) {
      const error = result.value

      switch (true) {
        case error instanceof ResourceNotFoundError:
          return new NotFoundException()

        case error instanceof InvalidCredentialsError:
          return new UnauthorizedException()

        default:
          return new InternalServerErrorException()
      }
    }

    const token = this.jwt.sign({
      sub: result.value.memberId.toString()
    })

    return {
      token
    }
  }
}
