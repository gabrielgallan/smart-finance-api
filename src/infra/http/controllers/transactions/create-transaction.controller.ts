import { BadRequestException, Body, Controller, InternalServerErrorException, NotFoundException, Post } from '@nestjs/common';
import { CreateTransactionUseCase } from '@/domain/finances/application/use-cases/create-transaction';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { MemberAccountNotFoundError } from '@/domain/finances/application/use-cases/errors/member-account-not-found-error';
import { InvalidTransactionOperationError } from '@/domain/finances/application/use-cases/errors/invalid-transaction-operation-error';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';

const createTransactionBodySchema = z.object({
    categoryId: z.string().uuid().optional(),
    title: z.string(),
    description: z.string().optional(),
    amount: z.coerce.number(),
    operation: z.union([z.literal('income'), z.literal('expense')]),
    method: z.string().optional(),
})

class CreateTransactionBodyDTO extends createZodDto(createTransactionBodySchema) { }

@Controller('/api')
@ApiTags('Transactions')
export class CreateTransactionController {
    constructor(
        private createTransaction: CreateTransactionUseCase
    ) { }

    @Post('/transactions')
    @ApiOperation({ summary: 'create a new transaction' })
    async handle(
        @CurrentUser() user: UserPayload,
        @Body(new ZodValidationPipe(createTransactionBodySchema)) body: CreateTransactionBodyDTO
    ) {
        const { categoryId, title, description, amount, operation, method } = body

        const result = await this.createTransaction.execute({
            memberId: user.sub,
            categoryId,
            title,
            description,
            amount,
            operation,
            method
        })

        if (result.isLeft()) {
            const error = result.value

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message)

                case MemberAccountNotFoundError:
                    throw new NotFoundException(error.message   )

                case InvalidTransactionOperationError:
                    throw new BadRequestException(error.message)

                default:
                    throw new InternalServerErrorException()
            }
        }

        return
    }
}
