import { IMembersRepository } from '../repositories/members-repository'
import { InMemoryMembersRepository } from 'test/repositories/in-memory-members-repository'
import { makeMember } from 'test/factories/make-member'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { makeAccount } from 'test/factories/make-account'
import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository'
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-category-repository'
import { ListAccountCategoriesUseCase } from './list-account-categories'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeCategory } from 'test/factories/make-category'
import { Slug } from '@/domain/finances/enterprise/entites/value-objects/slug'

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
