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

type CreateCategoryBodyDTO = z.infer<typeof createCategoryBodySchema>

type EditCategoryBodyDTO = z.infer<typeof editCategoryBodySchema>

type EditCategoryParamsDTO = z.infer<typeof editCategoryParamsSchema>

@Controller('/api/categories')
export class CategoryController {
    constructor(
        private createCategory: CreateAccountCategoryUseCase,
        private listCategories: ListAccountCategoriesUseCase,
        private editCategory: EditAccountCategoryUseCase,
    ) {}

    @Post()
    @HttpCode(201)
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

            switch (true) {
                case error instanceof ResourceNotFoundError:
                    return new NotFoundException({
                        message: error.message
                    })

                case error instanceof MemberAccountNotFoundError:
                    return new NotFoundException({
                        message: error.message
                    })

                case error instanceof CategoryAlreadyExistsError:
                    return new ConflictException({
                        message: error.message
                    })

                default:
                    return new InternalServerErrorException()
            }
        }

        return
    }

    @Get()
    @HttpCode(200)
    async list(
        @CurrentUser() user: UserPayload,
    ) {
        const result = await this.listCategories.execute({
            memberId: user.sub
        })

        if (result.isLeft()) {
            const error = result.value

            switch (true) {
                case error instanceof MemberAccountNotFoundError:
                    return new NotFoundException({
                        message: error.message
                    })

                default:
                    return new InternalServerErrorException()
            }
        }

        return {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            categories: result.value.categories.map(CategoryPresenter.toHTTP)
        }
    }

    @Put('/:slug')
    @HttpCode(204)
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

            switch (true) {
                case error instanceof ResourceNotFoundError:
                    return new NotFoundException({
                        message: error.message
                    })

                case error instanceof MemberAccountNotFoundError:
                    return new NotFoundException({
                        message: error.message
                    })

                case error instanceof CategoryAlreadyExistsError:
                    return new ConflictException({
                        message: error.message
                    })

                default:
                    return new InternalServerErrorException()
            }
        }

        return
    }
}