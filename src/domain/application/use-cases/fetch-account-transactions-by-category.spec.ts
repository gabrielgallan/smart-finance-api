import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { makeMember } from 'tests/factories/make-member.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { InMemoryAccountsRepository } from 'tests/repositories/in-memory-accounts-repository.ts'
import { makeAccount } from 'tests/factories/make-account.ts'
import { InMemoryTransactionsRepository } from 'tests/repositories/in-memory-transactions-repository.ts'
import { ITransactionsRepository } from '../repositories/transactions-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { ICategoriesRepository } from '../repositories/categories-repository.ts'
import { InMemoryCategoriesRepository } from 'tests/repositories/in-memory-category-repository.ts'
import { FetchAccountTransactionsByCategoryUseCase } from './fetch-account-transactions-by-category.ts'
import { makeCategory } from 'tests/factories/make-category.ts'
import { makeTransaction } from 'tests/factories/make-transaction.ts'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository
let categoriesRepository: ICategoriesRepository

let sut: FetchAccountTransactionsByCategoryUseCase

describe('Fetch account summary use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new FetchAccountTransactionsByCategoryUseCase(
      membersRepository,
      accountsRepository,
      transactionsRepository,
      categoriesRepository,
    )

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to get account summary by category', async () => {
    vi.setSystemTime(new Date(2025, 0, 13))

    await membersRepository.create(
      await makeMember({}, new UniqueEntityID('member-1')),
    )

    await accountsRepository.create(
      makeAccount(
        {
          holderId: new UniqueEntityID('member-1'),
          balance: 250,
        },
        new UniqueEntityID('account-1'),
      ),
    )

    await categoriesRepository.create(
      makeCategory(
        {
          accountId: new UniqueEntityID('account-1'),
          name: 'Sports',
        },
        new UniqueEntityID('category-1'),
      ),
    )

    await Promise.all(
      Array.from({ length: 3 }, () =>
        transactionsRepository.create(
          makeTransaction({
            accountId: new UniqueEntityID('account-1'),
            categoryId: new UniqueEntityID('category-1'),
          }),
        ),
      ),
    )

    await Promise.all(
      Array.from({ length: 7 }, () =>
        transactionsRepository.create(
          makeTransaction({
            accountId: new UniqueEntityID('account-1'),
          }),
        ),
      ),
    )

    const result = await sut.execute({
      memberId: 'member-1',
      categoryId: 'category-1',
      startDate: new Date(2025, 0, 12),
      endDate: new Date(2025, 0, 14),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(transactionsRepository.items).toHaveLength(10)
      expect(result.value.transactions).toHaveLength(3)
    }
  })

  it('should be able to get account summary by time interval and category', async () => {
    vi.setSystemTime(new Date(2025, 0, 13))

    await membersRepository.create(
      await makeMember({}, new UniqueEntityID('member-1')),
    )

    await accountsRepository.create(
      makeAccount(
        {
          holderId: new UniqueEntityID('member-1'),
          balance: 250,
        },
        new UniqueEntityID('account-1'),
      ),
    )

    await categoriesRepository.create(
      makeCategory(
        {
          accountId: new UniqueEntityID('account-1'),
          name: 'Sports',
        },
        new UniqueEntityID('category-1'),
      ),
    )

    await Promise.all(
      Array.from({ length: 3 }, () =>
        transactionsRepository.create(
          makeTransaction({
            accountId: new UniqueEntityID('account-1'),
            categoryId: new UniqueEntityID('category-1'),
          }),
        ),
      ),
    )

    vi.setSystemTime(new Date(2025, 0, 14))

    await Promise.all(
      Array.from({ length: 5 }, () =>
        transactionsRepository.create(
          makeTransaction({
            accountId: new UniqueEntityID('account-1'),
          }),
        ),
      ),
    )

    vi.setSystemTime(new Date(2025, 0, 15))

    await Promise.all(
      Array.from({ length: 4 }, () =>
        transactionsRepository.create(
          makeTransaction({
            accountId: new UniqueEntityID('account-1'),
            categoryId: new UniqueEntityID('category-1'),
          }),
        ),
      ),
    )

    const resultByCategory1 = await sut.execute({
      memberId: 'member-1',
      categoryId: 'category-1',
      startDate: new Date(2025, 0, 12),
      endDate: new Date(2025, 0, 16),
    })

    expect(resultByCategory1.isRight()).toBe(true)

    if (resultByCategory1.isRight()) {
      expect(transactionsRepository.items).toHaveLength(12)
      expect(resultByCategory1.value.transactions).toHaveLength(7)
    }
  })
})
