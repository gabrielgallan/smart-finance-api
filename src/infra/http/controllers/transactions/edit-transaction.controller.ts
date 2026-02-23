import { Body, Controller, HttpCode, InternalServerErrorException, NotFoundException, Param, Put, UnauthorizedException } from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { MemberAccountNotFoundError } from '@/domain/finances/application/use-cases/errors/member-account-not-found-error';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import z from 'zod';
import { EditTransactionUseCase } from '@/domain/finances/application/use-cases/edit-transaction';
import { NotAllowedError } from '@/core/errors/not-allowed-error';

const editTransactionBodySchema = z.object({
    categoryId: z.string().uuid().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    method: z.string().optional()
})

const editTransactionParamSchema = z.object({
    id: z.string().uuid()
})

type EditTransactionBodyDTO = z.infer<typeof editTransactionBodySchema>
type EditTransactionParamDTO = z.infer<typeof editTransactionParamSchema>

@Controller('/api')
export class EditAccountTransactionController {
    constructor(
        private editTransaction: EditTransactionUseCase
    ) {}

    @Put('/transactions/:id')
    @HttpCode(204)
    async handle(
        @CurrentUser() user: UserPayload,
        @Body(new ZodValidationPipe(editTransactionBodySchema)) body: EditTransactionBodyDTO,
        @Param(new ZodValidationPipe(editTransactionParamSchema)) params: EditTransactionParamDTO
    ) {
        const { id: transactionId } = params
        const { categoryId, title, description, method } = body

        const result = await this.editTransaction.execute({
            memberId: user.sub,
            transactionId,
            categoryId,
            title,
            description,
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

                case error instanceof NotAllowedError:
                    return new UnauthorizedException({
                        message: `This transaction doesn't belong to your account`
                    })

                default:
                    return new InternalServerErrorException()
            }
        }

        return
    }
}
