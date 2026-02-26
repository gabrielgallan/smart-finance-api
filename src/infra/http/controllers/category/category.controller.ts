/*
https://docs.nestjs.com/controllers#controllers
*/

import { CreateAccountCategoryUseCase } from '@/domain/finances/application/use-cases/create-account-category';
import { Body, ConflictException, Controller, Get, HttpCode, InternalServerErrorException, NotFoundException, Param, Post, Put } from '@nestjs/common';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { MemberAccountNotFoundError } from '@/domain/finances/application/use-cases/errors/member-account-not-found-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { CategoryAlreadyExistsError } from '@/domain/finances/application/use-cases/errors/category-already-exists-error';
import { ListAccountCategoriesUseCase } from '@/domain/finances/application/use-cases/list-account-categories';
import { CategoryPresenter } from '../../presenters/category-presenter';
import { EditAccountCategoryUseCase } from '@/domain/finances/application/use-cases/edit-account-category';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';

const createCategoryBodySchema = z.object({
    name: z.string(),
    description: z.string().optional()
})

const editCategoryBodySchema = z.object({
    name: z.string().optional(),
    description: z.string().optional()
})

const editCategoryParamsSchema = z.object({
    slug: z.string()
})

class CreateCategoryBodyDTO extends createZodDto(createCategoryBodySchema) { }

class EditCategoryBodyDTO extends createZodDto(editCategoryBodySchema) { }

class EditCategoryParamsDTO extends createZodDto(editCategoryParamsSchema) { }  

@Controller('/api/categories')
@ApiTags('Categories')
export class CategoryController {
    constructor(
        private createCategory: CreateAccountCategoryUseCase,
        private listCategories: ListAccountCategoriesUseCase,
        private editCategory: EditAccountCategoryUseCase,
    ) { }

    @Post()
    @ApiOperation({ summary: 'create a new account category' })
    async create(
        @CurrentUser() user: UserPayload,
        @Body(new ZodValidationPipe(createCategoryBodySchema)) body: CreateCategoryBodyDTO
    ) {
        console.log(body)
        const { name, description } = body

        const result = await this.createCategory.execute({
            memberId: user.sub,
            categoryName: name,
            categoryDescription: description
        })

        if (result.isLeft()) {
            const error = result.value

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message)

                case MemberAccountNotFoundError:
                    throw new NotFoundException(error.message)

                case CategoryAlreadyExistsError:
                    throw new ConflictException(error.message)

                default:
                    throw new InternalServerErrorException()
            }
        }

        return
    }

    @Get()
    @ApiOperation({ summary: 'list all account categories' })
    async list(
        @CurrentUser() user: UserPayload,
    ) {
        const result = await this.listCategories.execute({
            memberId: user.sub
        })

        if (result.isLeft()) {
            const error = result.value

            switch (error.constructor) {
                case MemberAccountNotFoundError:
                    throw new NotFoundException(error.message)

                default:
                    throw new InternalServerErrorException()
            }
        }

        return {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            categories: result.value.categories.map(CategoryPresenter.toHTTP)
        }
    }

    @Put('/:slug')
    @HttpCode(204)
    @ApiOperation({ summary: 'edit an account category' })
    async edit(
        @CurrentUser() user: UserPayload,
        @Body(new ZodValidationPipe(editCategoryBodySchema)) body: EditCategoryBodyDTO,
        @Param(new ZodValidationPipe(editCategoryParamsSchema)) params: EditCategoryParamsDTO
    ) {
        const { name, description } = body
        const { slug } = params

        const result = await this.editCategory.execute({
            memberId: user.sub,
            slug,
            name,
            description
        })

        if (result.isLeft()) {
            const error = result.value

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message)

                case MemberAccountNotFoundError:
                    throw new NotFoundException(error.message)

                case CategoryAlreadyExistsError:
                    throw new ConflictException(error.message)

                default:
                    throw new InternalServerErrorException()
            }
        }

        return
    }
}