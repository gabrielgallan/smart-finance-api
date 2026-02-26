import { Controller, Get, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { MemberAccountNotFoundError } from '@/domain/finances/application/use-cases/errors/member-account-not-found-error';
import { GetRollingYearProgressUseCase } from '@/domain/finances/application/use-cases/get-rolling-yearly-progress';
import { AccountYearSummaryPresenter } from '../../presenters/account-year-summary-presenter';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('/api')
@ApiTags('Summaries')
export class GetRollingYearProgressController {
    constructor(
        private getRollingYearProgress: GetRollingYearProgressUseCase
    ) { }

    @Get('/account/year/progress')
    @ApiOperation({ summary: 'get rolling year progress' })
    async handle(
        @CurrentUser() user: UserPayload,
    ) {
        const result = await this.getRollingYearProgress.execute({
            memberId: user.sub
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

        return {
            progress: AccountYearSummaryPresenter.toHTTP(result.value.yearAccountSummary),
        }
    }
}
