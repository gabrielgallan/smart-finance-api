/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { MemberAccountNotFoundError } from '@/domain/finances/application/use-cases/errors/member-account-not-found-error';
import { AccountSummaryPresenter } from '../../presenters/account-summary-presenter';
import { GetAccountSummariesByCategoriesUseCase } from '@/domain/finances/application/use-cases/get-account-summaries-by-categories';
import { AnyCategoryFoundForAccountError } from '@/domain/finances/application/use-cases/errors/any-category-found-for-account-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

const querySchema = z.object({
    start: z.coerce.date(),
    end: z.coerce.date()
})

type GetSummariesByCategoriesQueryDTO = z.infer<typeof querySchema>

@Controller('/api')
@ApiTags('Summaries')
export class GetSummariesByCategoriesController {
    constructor(
        private getSummariesByCategories: GetAccountSummariesByCategoriesUseCase
    ) { }

    @Get('/account/categories/summary')
    @ApiOperation({ summary: 'get account summaries grouped by categories for a given period' })
    async handle(
        @CurrentUser() user: UserPayload,
        @Query(new ZodValidationPipe(querySchema)) query: GetSummariesByCategoriesQueryDTO
    ) {
        const { start, end } = query

        const result = await this.getSummariesByCategories.execute({
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

                case AnyCategoryFoundForAccountError:
                    throw new NotFoundException(error.message   )

                case ResourceNotFoundError:
                    throw new NotFoundException(error.message)

                default:
                    throw new InternalServerErrorException()
            }
        }

        return {
            total: AccountSummaryPresenter.toHTTP(result.value.fullTermAccounSummary),
            // eslint-disable-next-line @typescript-eslint/unbound-method
            categories: result.value.fromCategoriesSummaries.map(AccountSummaryPresenter.toHTTP)
        }
    }
}
