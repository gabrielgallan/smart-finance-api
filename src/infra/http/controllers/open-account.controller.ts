import { Body, ConflictException, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service'
import z from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth-guard'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { UserPayload } from '@/infra/auth/jwt.strategy'

const openAccountBodySchema = z.object({
    initialBalance: z.coerce.number()
})

type OpenAccountBodyDTO = z.infer<typeof openAccountBodySchema>

@Controller('/api')
@UseGuards(JwtAuthGuard)
export class OpenAccountController {
  constructor(
    private prisma: PrismaService
  ) {}

  @Post('/accounts')
  @HttpCode(201)
  async handle(
    @CurrentUser() user: UserPayload, 
    @Body(new ZodValidationPipe(openAccountBodySchema)) body: OpenAccountBodyDTO
  ) {
    const { initialBalance } = body

    const userAlreadyHasAccount = await this.prisma.account.findUnique({
        where: { holderId: user.sub }
    })

    if (userAlreadyHasAccount) {
        throw new ConflictException('User already has account')
    }

    await this.prisma.account.create({
      data: {
        balance: initialBalance,
        holderId: user.sub
      }
    })

    return {}
  }
}
