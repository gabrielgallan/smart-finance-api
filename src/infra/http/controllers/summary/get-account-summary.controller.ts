/*
https://docs.nestjs.com/controllers#controllers
*/

import { BadRequestException, Controller, Get, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { GetAccountSummaryUseCase } from '@/domain/finances/application/use-cases/get-account-summary';
import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { MemberAccountNotFoundError } from '@/domain/finances/application/use-cases/errors/member-account-not-found-error';
import { InvalidPeriodError } from '@/domain/finances/application/use-cases/errors/invalid-period-error';
import { AccountSummaryPresenter } from '../../presenters/account-summary-presenter';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

const getAccountSummaryQuerySchema = z.object({
    start: z.coerce.date(),
    end: z.coerce.date()
})

type GetAccountSummaryQueryDTO = z.infer<typeof getAccountSummaryQuerySchema>

@Controller('/api')
@ApiTags('Summaries')
export class GetAccountSummaryController {
    constructor(
        private getAccountSummary: GetAccountSummaryUseCase
    ) { }

    @Get('/account/summary')
    @ApiOperation({ summary: 'get account summary for a given period' })
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

            switch (error.constructor) {
                case MemberAccountNotFoundError:
                    throw new NotFoundException(error.message)

                case InvalidPeriodError:
                    throw new BadRequestException(error.message)

                default:
                    throw new InternalServerErrorException()
            }
        }

        return {
            summary: AccountSummaryPresenter.toHTTP(result.value.summary)
        }
    }
}
