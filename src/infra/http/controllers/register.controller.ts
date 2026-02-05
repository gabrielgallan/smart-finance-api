import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import z from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'

const registerBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string()
})

type RegisterBodyDTO = z.infer<typeof registerBodySchema>

@Controller('/api')
export class RegisterController {
  constructor(
    private prisma: PrismaService
  ) {}

  @Post('/users')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(registerBodySchema))
  async handle(@Body() body: RegisterBodyDTO) {
    const { name, email, password } = body

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password
      }
    })

    return { user }
  }
}
