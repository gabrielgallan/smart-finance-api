import { ICategoriesRepository } from '../repositories/categories-repository'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { makeAccount } from 'test/unit/factories/make-account'
import { InMemoryAccountsRepository } from 'test/unit/repositories/in-memory-accounts-repository'
import { InMemoryCategoriesRepository } from 'test/unit/repositories/in-memory-category-repository'
import { CreateAccountCategoryUseCase } from './create-account-category'
import { CategoryAlreadyExistsError } from './errors/category-already-exists-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let accountsRepository: IAccountsRepository
let categoriesRepository: ICategoriesRepository

let sut: CreateAccountCategoryUseCase

describe('Create category use case', () => {
  beforeEach(() => {
    accountsRepository = new InMemoryAccountsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new CreateAccountCategoryUseCase(
      accountsRepository,
      categoriesRepository,
    )
  })

  it('should be able to create a category', async () => {
    await accountsRepository.create(
      makeAccount(
        {
          holderId: new UniqueEntityID('member-1'),
        },
        new UniqueEntityID('account-1'),
      ),
    )

    const result = await sut.execute({
      memberId: 'member-1',
      categoryName: 'Expenses from School',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.category.slug.value).toBe('expenses-from-school')
    }
  })

  it('should not be able to create two category with same slug to one account', async () => {
    await accountsRepository.create(
      makeAccount(
        {
          holderId: new UniqueEntityID('member-1'),
        },
        new UniqueEntityID('account-1'),
      ),
    )

    await sut.execute({
      memberId: 'member-1',
      categoryName: 'Sport expenses',
    })

    const result = await sut.execute({
      memberId: 'member-1',
      categoryName: 'Sport expenses',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(CategoryAlreadyExistsError)
  })

  it('should be able to create two category with different slug to one account', async () => {
    await accountsRepository.create(
      makeAccount(
        {
          holderId: new UniqueEntityID('member-1'),
        },
        new UniqueEntityID('account-1'),
      ),
    )

    const result1 = await sut.execute({
      memberId: 'member-1',
      categoryName: 'Sport expenses',
    })

    const result2 = await sut.execute({
      memberId: 'member-1',
      categoryName: 'Expenses from School',
    })

    expect(result1.isRight()).toBe(true)
    expect(result2.isRight()).toBe(true)

    if (result1.isRight() && result2.isRight()) {
      expect(result1.value.category.slug.value).toBe('sport-expenses')
      expect(result2.value.category.slug.value).toBe('expenses-from-school')

      expect(result1.value.category.accountId.toString()).toBe('account-1')
      expect(result2.value.category.accountId.toString()).toBe('account-1')
    }
  })
})
