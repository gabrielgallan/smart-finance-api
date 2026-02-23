import { Body, Controller, HttpCode, InternalServerErrorException, NotFoundException, Put } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { ResetMemberPasswordUseCase } from '@/domain/finances/application/use-cases/reset-member-password'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Public } from '@/infra/auth/public'

const bodySchema = z.object({
  code: z.string(),
  password: z.string().min(6)
})

type BodyDTO = z.infer<typeof bodySchema>

@Controller('/api')
@Public()
export class ResetPasswordController {
  constructor(
    private resetPassword: ResetMemberPasswordUseCase,
    private prisma: PrismaService,
  ) { }

  @Put('/profile/password')
  @HttpCode(204)
  async handle(
    @Body(new ZodValidationPipe(bodySchema)) body: BodyDTO
  ) {
    const { code, password } = body

    const token = await this.prisma.token.findFirst({
      where: {
        id: code,
        type: 'PASSWORD_RECOVER'
      }
    })

    if (!token) {
      throw new NotFoundException('Invalid code')
    }

    const result = await this.resetPassword.execute({
      memberId: token.memberId,
      password
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)

        default:
          throw new InternalServerErrorException()
      }
    }

    return
  }
}
