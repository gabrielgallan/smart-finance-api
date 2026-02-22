import { IAccountsRepository } from '../repositories/accounts-repository'
import { GetAccountSummaryByCategoryUseCase } from './get-account-summary-by-category'
import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository'
import { makeAccount } from 'test/factories/make-account'
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions-repository'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-category-repository'
import { makeTransaction } from 'test/factories/make-transaction'
import { TransactionOperation } from '@/domain/finances/enterprise/entities/transaction'
import { makeCategory } from 'test/factories/make-category'

let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository
let categoriesRepository: ICategoriesRepository

let sut: GetAccountSummaryByCategoryUseCase

describe('Get account summary by category use case', () => {
  beforeEach(() => {
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new GetAccountSummaryByCategoryUseCase(
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

    const account = makeAccount(
      {
        holderId: new UniqueEntityID('member-1'),
      },
      new UniqueEntityID('account-1'),
    )

    await accountsRepository.create(account)

    await categoriesRepository.create(
      makeCategory(
        {
          accountId: new UniqueEntityID('account-1'),
          name: 'Freelance jobs',
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
            amount: 50,
            operation: TransactionOperation.INCOME,
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
      expect(result.value.byCategorySummary.netBalance).toBe(150)
      expect(result.value.byCategorySummary.transactionsCount).toBe(3)
      expect(result.value.byCategorySummary.categoryId?.toString()).toBe('category-1')

      expect(result.value.byCategorySummary.percentages).toMatchObject(
        {
          totalIncomePercentage: expect.any(Number),
          totalExpensePercentage: expect.any(Number)
        }
      )
    }
  })
})
