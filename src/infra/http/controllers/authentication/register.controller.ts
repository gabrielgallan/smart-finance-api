import { Body, ConflictException, Controller, HttpCode, InternalServerErrorException, Post, UsePipes } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { Public } from '@/infra/auth/public'
import { RegisterUseCase } from '@/domain/identity/application/use-cases/register'
import { UserAlreadyExistsError } from '@/domain/identity/application/use-cases/errors/user-already-exists-error'

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
    private register: RegisterUseCase
  ) { }

  @Post('/users')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(registerBodySchema))
  async handle(@Body() body: RegisterBodyDTO) {
    const { name, email, password } = body

    const result = await this.register.execute({
      name,
      email,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new ConflictException(error.message)

        default:
          throw new InternalServerErrorException()
      }
    }

    return
  }
}