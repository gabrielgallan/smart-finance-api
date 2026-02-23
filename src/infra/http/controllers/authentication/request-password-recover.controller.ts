import { Body, Controller, HttpCode, NotFoundException, Post } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Public } from '@/infra/auth/public'
import { EmailService } from '@/infra/email/email.service'

const bodySchema = z.object({
  email: z.string().email()
})

type BodyDTO = z.infer<typeof bodySchema>

@Controller('/api')
@Public()
export class RequestPasswordRecoverController {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) { }

  @Post('/password/recover')
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(bodySchema)) body: BodyDTO
  ) {
    const { email } = body

    const member = await this.prisma.member.findUnique({
      where: {
        email
      }
    })

    if (!member) {
      throw new NotFoundException('Member not found')
    }

    const token = await this.prisma.token.create({
      data: {
        memberId: member.id,
        type: 'PASSWORD_RECOVER'
      }
    })

    if (!token) {
      throw new NotFoundException('Invalid code')
    }

    await this.emailService.sendEmail({
      to: email,
      subject: 'Password Recovery',
      text: `Use the following token to recover your password: ${token.id}`
    })

    return
  }
}
