import { BadRequestException, Body, Controller, HttpCode, NotFoundException, Post, UnauthorizedException, UsePipes } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import z from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { compare } from 'bcryptjs'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string()
})

type AuthenticateBodyDTO = z.infer<typeof authenticateBodySchema>

@Controller('/api')
export class AuthenticateController {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService
  ) {}

  @Post('/sessions')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodyDTO) {
    const { email, password } = body

    const userWithEmail = await this.prisma.user.findUnique({
      where: { email }
    })

    if (!userWithEmail) {
      throw new UnauthorizedException('Invalid credentials error')
    }

    const isPasswordCorrect = await compare(password, userWithEmail.password)

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid credentials error')
    }

    const token = this.jwt.sign({
      sub: userWithEmail.id
    })

    return {
      token
    }
  }
}
