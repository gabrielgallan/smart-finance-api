import { Body, ConflictException, Controller, HttpCode, InternalServerErrorException, Post, UsePipes } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { RegisterMemberUseCase } from '@/domain/finances/application/use-cases/register-member'
import { MemberAlreadyExistsError } from '@/domain/finances/application/use-cases/errors/member-already-exists-error'
import { Public } from '@/infra/auth/public'

const registerBodySchema = z.object({
  name: z.string(),
  document: z.string().optional(),
  email: z.string().email(),
  password: z.string()
})

type RegisterBodyDTO = z.infer<typeof registerBodySchema>

@Controller('/api')
@Public()
export class RegisterController {
  constructor(
    private registerMember: RegisterMemberUseCase
  ) {}

  @Post('/members')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(registerBodySchema))
  async handle(@Body() body: RegisterBodyDTO) {
    const { name, email, password, document } = body

    const result = await this.registerMember.execute({
      name,
      document,
      email,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case MemberAlreadyExistsError:
          throw new ConflictException(error.message)

        default:
          throw new InternalServerErrorException()
      }
    }

    return
  }
}