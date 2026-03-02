import { Controller, Get, HttpCode, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { UserPayload } from '@/infra/auth/jwt.strategy'
import { ApiTags } from '@nestjs/swagger'
import { GetAccountInfoUseCase } from '@/domain/finances/application/use-cases/get-account-info'
import { MemberAccountNotFoundError } from '@/domain/finances/application/use-cases/errors/member-account-not-found-error'

@ApiTags('Account')
@Controller('/api')
export class GetAccountInfoController {
    constructor(
        private getAccountInfo: GetAccountInfoUseCase
    ) { }

    @Get('/account')
    @HttpCode(200)
    async handle(
        @CurrentUser() user: UserPayload,
    ) {
        const result = await this.getAccountInfo.execute({
            memberId: user.sub,
        })

        if (result.isLeft()) {
            const error = result.value

            switch (error.constructor) {
                case MemberAccountNotFoundError:
                    throw new NotFoundException(error.message)

                default:
                    throw new InternalServerErrorException()
            }
        }

        return result.value
    }
}
