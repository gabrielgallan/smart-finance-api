import { Body, Controller, HttpCode, InternalServerErrorException, NotFoundException, Param, Put, UnauthorizedException } from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { MemberAccountNotFoundError } from '@/domain/finances/application/use-cases/errors/member-account-not-found-error';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import z from 'zod';
import { EditTransactionUseCase } from '@/domain/finances/application/use-cases/edit-transaction';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';

const editTransactionBodySchema = z.object({
    categoryId: z.string().uuid().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    method: z.string().optional()
})

const editTransactionParamSchema = z.object({
    id: z.string().uuid()
})

class EditTransactionBodyDTO extends createZodDto(editTransactionBodySchema) { }
class EditTransactionParamDTO extends createZodDto(editTransactionParamSchema) { }

@ApiTags('Transactions')
@Controller('/api')
export class EditAccountTransactionController {
    constructor(
        private editTransaction: EditTransactionUseCase
    ) { }

    @Put('/transactions/:id')
    @HttpCode(204)
    @ApiOperation({ summary: 'edit a transaction' })
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

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message)

                case MemberAccountNotFoundError:
                    throw new NotFoundException(error.message)

                case NotAllowedError:
                    throw new UnauthorizedException(`This transaction doesn't belong to your account`)

                default:
                    throw new InternalServerErrorException()
            }
        }

        return
    }
}
