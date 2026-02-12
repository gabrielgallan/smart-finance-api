import { Controller, Get, HttpCode, InternalServerErrorException, NotFoundException, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../auth/jwt-auth-guard'
import { CurrentUser } from '../../auth/current-user-decorator'
import type { UserPayload } from '../../auth/jwt.strategy'
import { GetMemberProfileUseCase } from '@/domain/finances/application/use-cases/get-member-profile'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { MemberPresenter } from '../presenters/member-presenter'

@Controller('/api')
@UseGuards(JwtAuthGuard)
export class GetProfileController {
  constructor(
    private getMemberProfile: GetMemberProfileUseCase
  ) { }

  @Get('/profile')
  @HttpCode(200)
  async handle(@CurrentUser() user: UserPayload) {
    const result = await this.getMemberProfile.execute({
      memberId: user.sub
    })

    if (result.isLeft()) {
      const error = result.value

      switch (true) {
        case error instanceof ResourceNotFoundError:
          return new NotFoundException({
            message: error.message
          })

        default:
          return new InternalServerErrorException()
      }
    }

    return {
      member: MemberPresenter.toHTTP(result.value.member)
    }
  }
}
