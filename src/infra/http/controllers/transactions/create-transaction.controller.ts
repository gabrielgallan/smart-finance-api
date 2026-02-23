import { BadRequestException, Body, Controller, HttpCode, InternalServerErrorException, NotFoundException, Post, UseGuards } from '@nestjs/common';
import { CreateTransactionUseCase } from '@/domain/finances/application/use-cases/create-transaction';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth-guard';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { MemberAccountNotFoundError } from '@/domain/finances/application/use-cases/errors/member-account-not-found-error';
import { InvalidTransactionOperationError } from '@/domain/finances/application/use-cases/errors/invalid-transaction-operation-error';

const createTransactionBodySchema = z.object({
    categoryId: z.string().uuid().optional(),
    title: z.string(),
    description: z.string().optional(),
    amount: z.coerce.number(),
    operation: z.union([z.literal('income'), z.literal('expense')]),
    method: z.string().optional(),
})

type CreateTransactionBodyDTO = z.infer<typeof createTransactionBodySchema>

@Controller('/api')
@UseGuards(JwtAuthGuard)
export class CreateTransactionController {
    constructor(
        private createTransaction: CreateTransactionUseCase
    ) { }

    @Post('/transactions')
    @HttpCode(201)
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

            switch (true) {
                case error instanceof ResourceNotFoundError:
                    return new NotFoundException({
                        message: error.message
                    })

                case error instanceof MemberAccountNotFoundError:
                    return new NotFoundException({
                        message: error.message
                    })

                case error instanceof InvalidTransactionOperationError:
                    return new BadRequestException({
                        message: error.message
                    })

                default:
                    return new InternalServerErrorException()
            }
        }

        return
    }
}
