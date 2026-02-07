import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { Either, left, right } from '@/core/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { Category } from '@/domain/finances/enterprise/entites/category'
import { ICategoriesRepository } from '../repositories/categories-repository'

interface FetchAccountCategoriesUseCaseRequest {
  memberId: string
}

type FetchAccountCategoriesUseCaseResponse = Either<
  ResourceNotFoundError | MemberAccountNotFoundError,
  {
    categories: Category[]
  }
>

export class FetchAccountCategoriesUseCase {
  constructor(
    private membersRepository: IMembersRepository,
    private accountsRepository: IAccountsRepository,
    private categoriesRepository: ICategoriesRepository,
  ) {}

  async execute({
    memberId,
  }: FetchAccountCategoriesUseCaseRequest): Promise<FetchAccountCategoriesUseCaseResponse> {
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
