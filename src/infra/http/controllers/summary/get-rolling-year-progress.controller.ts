import { Controller, Get, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { MemberAccountNotFoundError } from '@/domain/finances/application/use-cases/errors/member-account-not-found-error';
import { GetRollingYearProgressUseCase } from '@/domain/finances/application/use-cases/get-rolling-yearly-progress';
import { AccountYearSummaryPresenter } from '../../presenters/account-year-summary-presenter';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Summaries')
@Controller('/api')
export class GetRollingYearProgressController {
    constructor(
        private getRollingYearProgress: GetRollingYearProgressUseCase
    ) { }

    @Get('/account/year/progress')
    async handle(
        @CurrentUser() user: UserPayload,
    ) {
        const result = await this.getRollingYearProgress.execute({
            memberId: user.sub
        })

        if (result.isLeft()) {
            const error = result.value

            switch (true) {
                case error instanceof MemberAccountNotFoundError:
                    return new NotFoundException({
                        message: error.message
                    })

                default:
                    return new InternalServerErrorException()
            }
        }

        return {
            progress: AccountYearSummaryPresenter.toHTTP(result.value.yearAccountSummary),
        }
    }
}
