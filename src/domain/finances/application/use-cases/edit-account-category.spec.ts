import { ICategoriesRepository } from '../repositories/categories-repository'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { makeAccount } from 'test/factories/make-account'
import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository'
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-category-repository'
import { EditAccountCategoryUseCase } from './edit-account-category'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeCategory } from 'test/factories/make-category'

let accountsRepository: IAccountsRepository
let categoriesRepository: ICategoriesRepository

let sut: EditAccountCategoryUseCase

describe('Edit account category use case', () => {
  beforeEach(() => {
    accountsRepository = new InMemoryAccountsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new EditAccountCategoryUseCase(
      accountsRepository,
      categoriesRepository,
    )
  })

  it('should be able to edit account category', async () => {
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
      description: 'my food expenses'
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.category.slug.value).toBe('food-expenses')
      expect(result.value.category.description).toBe('my food expenses')
    }
  })
})
