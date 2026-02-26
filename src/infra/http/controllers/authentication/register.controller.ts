import { Body, ConflictException, Controller, InternalServerErrorException, Post } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { Public } from '@/infra/auth/public'
import { RegisterUseCase } from '@/domain/identity/application/use-cases/register'
import { UserAlreadyExistsError } from '@/domain/identity/application/use-cases/errors/user-already-exists-error'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'

const registerBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string()
})

class RegisterBodyDTO extends createZodDto(registerBodySchema) { }

@Controller('/api')
@Public()
@ApiTags('Authentication')
export class RegisterController {
  constructor(
    private register: RegisterUseCase
  ) { }

  @Post('/users')
  @ApiOperation({ summary: 'register new user' })
  async handle(
    @Body(new ZodValidationPipe(registerBodySchema))
    body: RegisterBodyDTO
  ) {
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