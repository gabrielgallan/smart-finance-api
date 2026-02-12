/*
https://docs.nestjs.com/controllers#controllers
*/

import { CreateAccountCategoryUseCase } from '@/domain/finances/application/use-cases/create-account-category';
import { Body, ConflictException, Controller, Get, HttpCode, InternalServerErrorException, NotFoundException, Post, UsePipes } from '@nestjs/common';
import z from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { MemberAccountNotFoundError } from '@/domain/finances/application/use-cases/errors/member-account-not-found-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { CategoryAlreadyExistsError } from '@/domain/finances/application/use-cases/errors/category-already-exists-error';
import { ListAccountCategoriesUseCase } from '@/domain/finances/application/use-cases/list-account-categories';
import { CategoryPresenter } from '../presenters/category-presenter';

const createCategoryBodySchema = z.object({
    name: z.string(),
    description: z.string().optional()
})

type CreateCategoryBodyDTO = z.infer<typeof createCategoryBodySchema>

@Controller('/api/categories')
export class CategoryController {
    constructor(
        private createCategory: CreateAccountCategoryUseCase,
        private listCategories: ListAccountCategoriesUseCase
    ) {}

    @Post()
    @HttpCode(201)
    @UsePipes(new ZodValidationPipe(createCategoryBodySchema))
    async create(
        @CurrentUser() user: UserPayload,
        @Body() body: CreateCategoryBodyDTO
    ) {
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

        return {}
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
            categories: result.value.categories.map(c => CategoryPresenter.toHTTP(c))
        }
    }
}
