/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, InternalServerErrorException, NotFoundException, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth-guard';
import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { MemberAccountNotFoundError } from '@/domain/finances/application/use-cases/errors/member-account-not-found-error';
import { AccountSummaryPresenter } from '../../presenters/account-summary-presenter';
import { GetAccountSummariesByCategoriesUseCase } from '@/domain/finances/application/use-cases/get-account-summaries-by-categories';
import { AnyCategoryFoundForAccountError } from '@/domain/finances/application/use-cases/errors/any-category-found-for-account-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

const querySchema = z.object({
    start: z.coerce.date(),
    end: z.coerce.date()
})

type QueryDTO = z.infer<typeof querySchema>

@Controller('/api')
export class GetSummariesByCategoriesController {
    constructor(
        private getSummariesByCategories: GetAccountSummariesByCategoriesUseCase
    ) { }

    @Get('/account/categories/summary')
    @UseGuards(JwtAuthGuard)
    async handle(
        @CurrentUser() user: UserPayload,
        @Query(new ZodValidationPipe(querySchema)) query: QueryDTO
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

            switch (true) {
                case error instanceof MemberAccountNotFoundError:
                    return new NotFoundException({
                        message: error.message
                    })

                case error instanceof AnyCategoryFoundForAccountError:
                    return new NotFoundException({
                        message: error.message
                    })

                case error instanceof ResourceNotFoundError:
                    return new NotFoundException({
                        message: error.message
                    })

                default:
                    return new InternalServerErrorException()
            }
        }

        return {
            total: AccountSummaryPresenter.toHTTP(result.value.fullTermAccounSummary),
            // eslint-disable-next-line @typescript-eslint/unbound-method
            categories: result.value.fromCategoriesSummaries.map(AccountSummaryPresenter.toHTTP)
        }
    }
}
