import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { makeMember } from 'tests/factories/make-member.ts'
import { ICategoriesRepository } from '../repositories/categories-repository.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { makeAccount } from 'tests/factories/make-account.ts'
import { InMemoryAccountsRepository } from 'tests/repositories/in-memory-accounts-repository.ts'
import { InMemoryCategoriesRepository } from 'tests/repositories/in-memory-category-repository.ts'
import { EditAccountCategoryUseCase } from './edit-account-category.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { makeCategory } from 'tests/factories/make-category.ts'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository
let categoriesRepository: ICategoriesRepository

let sut: EditAccountCategoryUseCase

describe('Edit account category use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountsRepository = new InMemoryAccountsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new EditAccountCategoryUseCase(
      membersRepository,
      accountsRepository,
      categoriesRepository,
    )
  })

  it('should be able to edit account category', async () => {
    await membersRepository.create(
      await makeMember({}, new UniqueEntityID('member-1')),
    )

    await accountsRepository.create(
      makeAccount(
        {
          holderId: new UniqueEntityID('member-1'),
        },
        new UniqueEntityID('account-1'),
      ),
    )

    await categoriesRepository.create(
      makeCategory(
        {
          accountId: new UniqueEntityID('account-1'),
          name: 'Sports Expenses',
        },
        new UniqueEntityID('category-1'),
      ),
    )

    expect(categoriesRepository.items[0].slug.value).toBe('sports-expenses')

    const result = await sut.execute({
      memberId: 'member-1',
      categoryId: 'category-1',
      name: 'Food Expenses',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.category.slug.value).toBe('food-expenses')
    }
  })
})
