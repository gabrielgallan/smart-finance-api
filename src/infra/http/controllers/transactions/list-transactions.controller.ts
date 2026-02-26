import { Controller, Get, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { MemberAccountNotFoundError } from '@/domain/finances/application/use-cases/errors/member-account-not-found-error';
import { ListAccountTransactionsUseCase } from '@/domain/finances/application/use-cases/list-account-transactions';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import z from 'zod';
import { DateInterval } from '@/core/types/repositories/date-interval';
import { TransactionPresenter } from '../../presenters/transaction-presenter';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';

const listQuerySchema = z.object({
    categoryId: z.string().uuid().optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    start: z.coerce.date().optional(),
    end: z.coerce.date().optional(),
})

type ListQueryDTO = z.infer<typeof listQuerySchema>

@Controller('/api')
@ApiTags('Transactions')
export class ListAccountTransactionsController {
    constructor(
        private listTransactions: ListAccountTransactionsUseCase
    ) { }

    @Get('/transactions')
    @ApiOperation({ summary: 'list account transactions with pagination and optional filters' })
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

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message)

                case MemberAccountNotFoundError:
                    throw new NotFoundException(error.message)

                default:
                    throw new InternalServerErrorException()
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
