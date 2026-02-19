import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { Category } from '@/domain/finances/enterprise/entites/category'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { Injectable } from '@nestjs/common'

interface ListAccountCategoriesUseCaseRequest {
  memberId: string
}

type ListAccountCategoriesUseCaseResponse = Either<
  ResourceNotFoundError | MemberAccountNotFoundError,
  {
    categories: Category[]
  }
>

@Injectable()
export class ListAccountCategoriesUseCase {
  constructor(
    private membersRepository: IMembersRepository,
    private accountsRepository: IAccountsRepository,
    private categoriesRepository: ICategoriesRepository,
  ) {}

  async execute({
    memberId,
  }: ListAccountCategoriesUseCaseRequest): Promise<ListAccountCategoriesUseCaseResponse> {
    const member = await this.membersRepository.findById(memberId)

    if (!member) {
      return left(new ResourceNotFoundError())
    }

    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    const categories = await this.categoriesRepository.findManyByAccountId(
      account.id.toString(),
    )

    return right({
      categories,
    })
  }
}
