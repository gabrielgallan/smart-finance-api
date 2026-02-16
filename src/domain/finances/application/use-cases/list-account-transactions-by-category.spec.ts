import { IMembersRepository } from '../repositories/members-repository'
import { InMemoryMembersRepository } from 'test/repositories/in-memory-members-repository'
import { makeMember } from 'test/factories/make-member'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository'
import { makeAccount } from 'test/factories/make-account'
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions-repository'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-category-repository'
import { ListAccountTransactionsByCategoryUseCase } from './list-account-transactions-by-category'
import { makeCategory } from 'test/factories/make-category'
import { makeTransaction } from 'test/factories/make-transaction'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository
let categoriesRepository: ICategoriesRepository

let sut: ListAccountTransactionsByCategoryUseCase

describe('List account trasanctions by interval and category use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new ListAccountTransactionsByCategoryUseCase(
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

  it('should be able to list transactions by category and time interval', async () => {
    vi.setSystemTime(new Date(2025, 0, 13))

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

    vi.setSystemTime(new Date(2025, 1, 13))

    await Promise.all(
      Array.from({ length: 2 }, () =>
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
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2025, 1, 28),
      limit: 10,
      page: 1,
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(transactionsRepository.items).toHaveLength(5)
      expect(result.value.transactions).toHaveLength(3)
    }
  })
})
