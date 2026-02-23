/*
https://docs.nestjs.com/controllers#controllers
*/

import { BadRequestException, Controller, Get, HttpCode, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { GetAccountSummaryUseCase } from '@/domain/finances/application/use-cases/get-account-summary';
import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { MemberAccountNotFoundError } from '@/domain/finances/application/use-cases/errors/member-account-not-found-error';
import { InvalidPeriodError } from '@/domain/finances/application/use-cases/errors/invalid-period-error';
import { AccountSummaryPresenter } from '../../presenters/account-summary-presenter';

const getAccountSummaryQuerySchema = z.object({
    start: z.coerce.date(),
    end: z.coerce.date()
})

type GetAccountSummaryQueryDTO = z.infer<typeof getAccountSummaryQuerySchema>

@Controller('/api')
export class GetAccountSummaryController {
    constructor(
        private getAccountSummary: GetAccountSummaryUseCase
    ) { }

    @Get('/account/summary')
    @HttpCode(200)
    async handle(
        @CurrentUser() user: UserPayload,
        @Query(new ZodValidationPipe(getAccountSummaryQuerySchema)) query: GetAccountSummaryQueryDTO
    ) {
        const { start, end } = query

        const result = await this.getAccountSummary.execute({
            memberId: user.sub,
            interval: {
                startDate: start,
                endDate: end
            }
        })

        if (result.isLeft()) {
            const error = result.value

            switch (true) {
                case error instanceof MemberAccountNotFoundError:
                    return new NotFoundException({
                        message: error.message
                    })

                case error instanceof InvalidPeriodError:
                    return new BadRequestException({
                        message: error.message
                    })

                default:
                    return new InternalServerErrorException()
            }
        }

        return {
            summary: AccountSummaryPresenter.toHTTP(result.value.summary)
        }
    }
}
