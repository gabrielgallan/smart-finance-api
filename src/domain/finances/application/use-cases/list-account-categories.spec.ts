import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from 'test/repositories/in-memory-members-repository.ts'
import { makeMember } from 'test/factories/make-member.ts'
import { ICategoriesRepository } from '../repositories/categories-repository.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { makeAccount } from 'test/factories/make-account.ts'
import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository.ts'
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-category-repository.ts'
import { ListAccountCategoriesUseCase } from './list-account-categories.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { makeCategory } from 'test/factories/make-category.ts'
import { Slug } from '@/domain/finances/enterprise/entites/value-objects/slug.ts'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository
let categoriesRepository: ICategoriesRepository

let sut: ListAccountCategoriesUseCase

describe('List account categories use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountsRepository = new InMemoryAccountsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new ListAccountCategoriesUseCase(
      membersRepository,
      accountsRepository,
      categoriesRepository,
    )
  })

  it('should be able to list account categories', async () => {
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
      makeCategory({
        accountId: new UniqueEntityID('account-1'),
        name: 'Sports Expenses',
      }),
    )

    const result = await sut.execute({
      memberId: 'member-1',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.categories).toEqual([
        expect.objectContaining({
          name: 'Sports Expenses',
          slug: new Slug('sports-expenses'),
        }),
      ])
    }
  })
})
