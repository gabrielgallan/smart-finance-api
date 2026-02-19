import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { Category } from '@/domain/finances/enterprise/entites/category'
import { Slug } from '@/domain/finances/enterprise/entites/value-objects/slug'
import { CategoryAlreadyExistsError } from './errors/category-already-exists-error'
import { Injectable } from '@nestjs/common'

interface EditAccountCategoryUseCaseRequest {
  memberId: string
  categoryId: string
  name?: string
  description?: string
}

type EditAccountCategoryUseCaseResponse = Either<
  | ResourceNotFoundError
  | MemberAccountNotFoundError
  | CategoryAlreadyExistsError,
  {
    category: Category
  }
>

@Injectable()
export class EditAccountCategoryUseCase {
  constructor(
    private membersRepository: IMembersRepository,
    private accountsRepository: IAccountsRepository,
    private categoriesRepository: ICategoriesRepository,
  ) {}

  async execute({
    memberId,
    categoryId,
    name,
    description,
  }: EditAccountCategoryUseCaseRequest): Promise<EditAccountCategoryUseCaseResponse> {
    const member = await this.membersRepository.findById(memberId)

    if (!member) {
      return left(new ResourceNotFoundError())
    }

    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    const category = await this.categoriesRepository.findById(categoryId)

    if (!category) {
      return left(new ResourceNotFoundError())
    }

    if (name) {
      const nameSlug = Slug.createFromText(name)

      const categoryWithSameName =
        await this.categoriesRepository.findByAccountIdAndSlug(
          account.id.toString(),
          nameSlug.value,
        )

      if (categoryWithSameName) {
        return left(new CategoryAlreadyExistsError())
      }

      category.name = name
    }

    if (description) {
      category.description = description
    }

    await this.categoriesRepository.save(category)

    return right({
      category,
    })
  }
}
