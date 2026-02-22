import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { Category } from '@/domain/finances/enterprise/entities/category'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { Slug } from '@/domain/finances/enterprise/entities/value-objects/slug'
import { CategoryAlreadyExistsError } from './errors/category-already-exists-error'
import { Injectable } from '@nestjs/common'

interface CreateAccountCategoryUseCaseRequest {
  memberId: string
  categoryName: string
  categoryDescription?: string
}

type CreateAccountCategoryUseCaseResponse = Either<
  | MemberAccountNotFoundError
  | CategoryAlreadyExistsError,
  {
    category: Category
  }
>

@Injectable()
export class CreateAccountCategoryUseCase {
  constructor(
    private accountsRepository: IAccountsRepository,
    private categoriesRepository: ICategoriesRepository,
  ) {}

  async execute({
    memberId,
    categoryName,
    categoryDescription,
  }: CreateAccountCategoryUseCaseRequest): Promise<CreateAccountCategoryUseCaseResponse> {
    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    const categorySlug = Slug.createFromText(categoryName)

    const accountCategoryWithSameSlug =
      await this.categoriesRepository.findByAccountIdAndSlug(
        account.id.toString(),
        categorySlug.value,
      )

    if (accountCategoryWithSameSlug) {
      return left(new CategoryAlreadyExistsError())
    }

    const category = Category.create({
      accountId: account.id,
      name: categoryName,
      slug: categorySlug,
      description: categoryDescription,
    })

    await this.categoriesRepository.create(category)

    return right({
      category,
    })
  }
}
