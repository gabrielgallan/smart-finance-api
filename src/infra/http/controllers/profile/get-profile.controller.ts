import { Controller, Get, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { CurrentUser } from '../../../auth/current-user-decorator'
import type { UserPayload } from '../../../auth/jwt.strategy'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { GetProfileUseCase } from '@/domain/identity/application/use-cases/get-profile'
import { UserPresenter } from '../../presenters/user-presenter'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@Controller('/api')
@ApiTags('Profile')
export class GetProfileController {
  constructor(
    private getProfile: GetProfileUseCase
  ) { }

  @Get('/profile')
  @ApiOperation({ summary: 'get user profile' })
  async handle(
    @CurrentUser() user: UserPayload
  ) {
    const result = await this.getProfile.execute({
      userId: user.sub
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

    return {
      user: UserPresenter.toHTTP(result.value.user)
    }
  }
}
