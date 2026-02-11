import { Controller, Get, HttpCode, InternalServerErrorException, NotFoundException, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../auth/jwt-auth-guard'
import { CurrentUser } from '../../auth/current-user-decorator'
import type { UserPayload } from '../../auth/jwt.strategy'
import { PrismaMembersRepository } from '@/infra/database/prisma/repositories/prisma-members-repository'
import { GetMemberProfileUseCase } from '@/domain/finances/application/use-cases/get-member-profile'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

@Controller('/api')
@UseGuards(JwtAuthGuard)
export class GetProfileController {
  constructor(
    private membersRepository: PrismaMembersRepository
  ) { }

  @Get('/profile')
  @HttpCode(200)
  async handle(@CurrentUser() user: UserPayload) {
    const getProfileUseCase = new GetMemberProfileUseCase(
      this.membersRepository
    )

    const result = await getProfileUseCase.execute({
      memberId: user.sub
    })

    if (result.isLeft()) {
      const error = result.value

      switch (true) {
        case error instanceof ResourceNotFoundError:
          return new NotFoundException()

        default:
          return new InternalServerErrorException()
      }
    }

    return {
      profile: {
        ...result.value.member,
        password: undefined,
        id: undefined,
      }
    }
  }
}
