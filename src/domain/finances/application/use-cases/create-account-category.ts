import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { Category } from '@/domain/finances/enterprise/entites/category'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { Slug } from '@/domain/finances/enterprise/entites/value-objects/slug'
import { CategoryAlreadyExistsError } from './errors/category-already-exists-error'
import { Injectable } from '@nestjs/common'

interface CreateAccountCategoryUseCaseRequest {
  memberId: string
  categoryName: string
  categoryDescription?: string
}

type CreateAccountCategoryUseCaseResponse = Either<
  | ResourceNotFoundError
  | MemberAccountNotFoundError
  | CategoryAlreadyExistsError,
  {
    category: Category
  }
>

@Injectable()
export class CreateAccountCategoryUseCase {
  constructor(
    private membersRepository: IMembersRepository,
    private accountsRepository: IAccountsRepository,
    private categoriesRepository: ICategoriesRepository,
  ) {}

  async execute({
    memberId,
    categoryName,
    categoryDescription,
  }: CreateAccountCategoryUseCaseRequest): Promise<CreateAccountCategoryUseCaseResponse> {
    const member = await this.membersRepository.findById(memberId)

    if (!member) {
      return left(new ResourceNotFoundError())
    }

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
