import { InMemoryAccountsRepository } from 'test/unit/repositories/in-memory-accounts-repository'
import { makeAccount } from 'test/unit/factories/make-account'
import { InMemoryTransactionsRepository } from 'test/unit/repositories/in-memory-transactions-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryCategoriesRepository } from 'test/unit/repositories/in-memory-category-repository'
import { ListAccountTransactionsUseCase } from './list-account-transactions'
import { makeCategory } from 'test/unit/factories/make-category'
import { makeTransaction } from 'test/unit/factories/make-transaction'

let accountsRepository: InMemoryAccountsRepository
let transactionsRepository: InMemoryTransactionsRepository
let categoriesRepository: InMemoryCategoriesRepository

let sut: ListAccountTransactionsUseCase

describe('List account trasanctions by interval and category use case', () => {
  beforeEach(() => {
    accountsRepository = new InMemoryAccountsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()
    transactionsRepository = new InMemoryTransactionsRepository()

    sut = new ListAccountTransactionsUseCase(
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
      filters: {
        categoryId: 'category-1',
        interval: {
          startDate: new Date(2025, 0, 1),
          endDate: new Date(2025, 1, 28),
        }
      }
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(transactionsRepository.items).toHaveLength(5)
      expect(result.value.transactions).toHaveLength(3)

      expect(result.value.transactions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ category: expect.objectContaining({ slug: 'sports' }) }),
          expect.objectContaining({ category: expect.objectContaining({ slug: 'sports' }) }),
          expect.objectContaining({ category: expect.objectContaining({ slug: 'sports' }) }),
        ])
      )
    }
  })
})
