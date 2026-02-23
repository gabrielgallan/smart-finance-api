import { Controller, Get, InternalServerErrorException, NotFoundException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth-guard';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { MemberAccountNotFoundError } from '@/domain/finances/application/use-cases/errors/member-account-not-found-error';
import { GetRollingYearProgressUseCase } from '@/domain/finances/application/use-cases/get-rolling-yearly-progress';
import { AccountYearSummaryPresenter } from '../../presenters/account-year-summary-presenter';

@Controller('/api')
export class GetRollingYearProgressController {
    constructor(
        private getRollingYearProgress: GetRollingYearProgressUseCase
    ) { }

    @Get('/account/year/progress')
    @UseGuards(JwtAuthGuard)
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
