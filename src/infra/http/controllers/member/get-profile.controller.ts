import { Controller, Get, HttpCode, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { CurrentUser } from '../../../auth/current-user-decorator'
import type { UserPayload } from '../../../auth/jwt.strategy'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { GetProfileUseCase } from '@/domain/identity/application/use-cases/get-profile'
import { UserPresenter } from '../../presenters/user-presenter'

@Controller('/api')
export class GetProfileController {
  constructor(
    private getProfile: GetProfileUseCase
  ) { }

  @Get('/profile')
  @HttpCode(200)
  async handle(@CurrentUser() user: UserPayload) {
    const result = await this.getProfile.execute({
      userId: user.sub
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
      user: UserPresenter.toHTTP(result.value.user)
    }
  }
}
