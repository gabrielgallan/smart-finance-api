import { Controller, Get, HttpCode, NotFoundException, UseGuards } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { JwtAuthGuard } from '../../auth/jwt-auth-guard'
import { CurrentUser } from '../../auth/current-user-decorator'
import type { UserPayload } from '../../auth/jwt.strategy'

@Controller('/api')
@UseGuards(JwtAuthGuard)
export class GetProfileController {
  constructor(
    private prisma: PrismaService
  ) {}

  @Get('/profile')
  @HttpCode(200)
  async handle(@CurrentUser() user: UserPayload) {
    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: user.sub
      }
    })

    if (!currentUser) {
      throw new NotFoundException('Resource not found!')
    }

    return {
      profile: {
        ...currentUser,
        password: undefined,
        id: undefined,
        accountId: undefined
      }
    }
  }
}
