import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { ResourceNotFoundError } from './errors/resource-not-found-error.ts'
import { makeMember } from 'tests/factories/make-member.ts'
import { ICategoriesRepository } from '../repositories/categories-repository.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { makeAccount } from 'tests/factories/make-account.ts'
import { InMemoryAccountsRepository } from 'tests/repositories/in-memory-accounts-repository.ts'
import { InMemoryCategoriesRepository } from 'tests/repositories/in-memory-category-repository.ts'
import { CreateAccountCategoryUseCase } from './create-account-category.ts'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error.ts'
import { CategoryAlreadyExistsError } from './errors/category-already-exists-error.ts'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository
let categoriesRepository: ICategoriesRepository

let sut: CreateAccountCategoryUseCase

describe('Create category use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountsRepository = new InMemoryAccountsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new CreateAccountCategoryUseCase(
      membersRepository,
      accountsRepository,
      categoriesRepository,
    )
  })

  it('should be able to create a category', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const account = await makeAccount({
      holderId: member.id,
    })
    await accountsRepository.create(account)

    const result = await sut.execute({
      memberId: member.id.toString(),
      categoryName: 'Expenses from School',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.category.slug.value).toBe('expenses-from-school')
    }
  })

  it('should not be able to create a category from a member does not exists', async () => {
    const result = await sut.execute({
      memberId: 'non-exists-member-id',
      categoryName: 'Expenses from School',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create a category from a member does not have a account', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const result = await sut.execute({
      memberId: member.id.toString(),
      categoryName: 'Expenses from School',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(MemberAccountNotFoundError)
  })

  it('should not be able to create two category with same slug to one account', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const account = await makeAccount({
      holderId: member.id,
    })
    await accountsRepository.create(account)

    await sut.execute({
      memberId: member.id.toString(),
      categoryName: 'Expenses from School',
    })

    const result = await sut.execute({
      memberId: member.id.toString(),
      categoryName: 'Expenses from School',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(CategoryAlreadyExistsError)
  })

  it('should be able to create two category with different slug to one account', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const account = await makeAccount({
      holderId: member.id,
    })
    await accountsRepository.create(account)

    const result1 = await sut.execute({
      memberId: member.id.toString(),
      categoryName: 'Sport expenses',
    })

    const result2 = await sut.execute({
      memberId: member.id.toString(),
      categoryName: 'Expenses from School',
    })

    expect(result1.isRight()).toBe(true)
    expect(result2.isRight()).toBe(true)

    if (result1.isRight() && result2.isRight()) {
      expect(result1.value.category.slug.value).toBe('sport-expenses')
      expect(result2.value.category.slug.value).toBe('expenses-from-school')

      expect(result1.value.category.accountId).toBe(account.id)
      expect(result2.value.category.accountId).toBe(account.id)
    }
  })
})
