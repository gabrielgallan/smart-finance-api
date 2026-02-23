import { Controller, Get, HttpCode, InternalServerErrorException, NotFoundException, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth-guard';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { MemberAccountNotFoundError } from '@/domain/finances/application/use-cases/errors/member-account-not-found-error';
import { ListAccountTransactionsUseCase } from '@/domain/finances/application/use-cases/list-account-transactions';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import z from 'zod';
import { DateInterval } from '@/core/types/repositories/date-interval';
import { TransactionPresenter } from '../../presenters/transaction-presenter';

const listQuerySchema = z.object({
    categoryId: z.string().uuid().optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    start: z.coerce.date().optional(),
    end: z.coerce.date().optional(),
})

type ListQueryDTO = z.infer<typeof listQuerySchema>

@Controller('/api')
@UseGuards(JwtAuthGuard)
export class ListAccountTransactionsController {
    constructor(
        private listTransactions: ListAccountTransactionsUseCase
    ) {}

    @Get('/transactions')
    @HttpCode(200)
    async handle(
        @CurrentUser() user: UserPayload,
        @Query(new ZodValidationPipe(listQuerySchema)) query: ListQueryDTO
    ) {
        const { categoryId, page, limit, start, end } = query

        const interval: DateInterval | undefined = start && end ?
        {
            startDate: start,
            endDate: end
        } : undefined

        const result = await this.listTransactions.execute({
            memberId: user.sub,
            filters: {
                categoryId,
                interval,
            },
            page,
            limit
        })

        if (result.isLeft()) {
            const error = result.value

            switch (true) {
                case error instanceof ResourceNotFoundError:
                    return new NotFoundException({
                        message: error.message
                    })

                case error instanceof MemberAccountNotFoundError:
                    return new NotFoundException({
                        message: error.message
                    })

                default:
                    return new InternalServerErrorException()
            }
        }

        return {
            interval: result.value.interval,
            // eslint-disable-next-line @typescript-eslint/unbound-method
            transactions: result.value.transactions.map(TransactionPresenter.toHTTP),
            pagination: result.value.pagination
        }
    }
}
