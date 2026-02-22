import { Body, ConflictException, Controller, HttpCode, InternalServerErrorException, NotFoundException, Put, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../../auth/jwt-auth-guard'
import { CurrentUser } from '../../../auth/current-user-decorator'
import type { UserPayload } from '../../../auth/jwt.strategy'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { EditMemberProfileUseCase } from '@/domain/finances/application/use-cases/edit-member-profile'
import z from 'zod'
import { ZodValidationPipe } from 'dist/http/pipes/zod-validation-pipe'
import { MemberAlreadyExistsError } from '@/domain/finances/application/use-cases/errors/member-already-exists-error'

const editProfileBodySchema = z.object({
  email: z.string().email()
})

type EditProfileBodyDTO = z.infer<typeof editProfileBodySchema>

@Controller('/api')
@UseGuards(JwtAuthGuard)
export class EditProfileController {
  constructor(
    private editProfile: EditMemberProfileUseCase
  ) { }

  @Put('/profile')
  @HttpCode(204)
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(editProfileBodySchema)) body: EditProfileBodyDTO
  ) {
    const { email } = body

    const result = await this.editProfile.execute({
      memberId: user.sub,
      email
    })

    if (result.isLeft()) {
      const error = result.value

      switch (true) {
        case error instanceof ResourceNotFoundError:
          return new NotFoundException({
            message: error.message
          })

        case error instanceof MemberAlreadyExistsError:
          return new ConflictException({
            message: error.message
          })

        default:
          return new InternalServerErrorException()
      }
    }

    return
  }
}
