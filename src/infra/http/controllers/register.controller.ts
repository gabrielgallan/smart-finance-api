import { BadRequestException, Body, ConflictException, Controller, HttpCode, InternalServerErrorException, Post, UsePipes } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { PrismaMembersRepository } from '@/infra/database/prisma/repositories/prisma-members-repository'
import { RegisterMemberUseCase } from '@/domain/finances/application/use-cases/register-member'
import { InvalidMemberAgeError } from '@/domain/finances/application/use-cases/errors/invalid-member-age-erros'
import { MemberAlreadyExistsError } from '@/domain/finances/application/use-cases/errors/member-already-exists-error'

const registerBodySchema = z.object({
  name: z.string(),
  birthDate: z.coerce.date(),
  document: z.string().optional(),
  email: z.string().email(),
  password: z.string()
})

type RegisterBodyDTO = z.infer<typeof registerBodySchema>

@Controller('/api')
export class RegisterController {
  constructor(
    private membersRepository: PrismaMembersRepository
  ) { }

  @Post('/members')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(registerBodySchema))
  async handle(@Body() body: RegisterBodyDTO) {
    const { name, email, password, birthDate, document } = body

    const registerMemberuseCase = new RegisterMemberUseCase(
      this.membersRepository
    )

    const result = await registerMemberuseCase.execute({
      name,
      birthDate,
      document,
      email,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (true) {
        case error instanceof InvalidMemberAgeError:
          return new BadRequestException()

        case error instanceof MemberAlreadyExistsError:
          return new ConflictException()

        default:
          return new InternalServerErrorException()
      }
    }

    return {}
  }
}