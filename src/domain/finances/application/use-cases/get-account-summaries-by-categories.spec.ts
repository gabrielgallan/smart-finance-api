import { IAccountsRepository } from '../repositories/accounts-repository'
import { GetAccountSummariesByCategoriesUseCase } from './get-account-summaries-by-categories'
import { InMemoryAccountsRepository } from 'test/unit/repositories/in-memory-accounts-repository'
import { makeAccount } from 'test/unit/factories/make-account'
import { InMemoryTransactionsRepository } from 'test/unit/repositories/in-memory-transactions-repository'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { InMemoryCategoriesRepository } from 'test/unit/repositories/in-memory-category-repository'
import { makeTransaction } from 'test/unit/factories/make-transaction'
import { TransactionOperation } from '@/domain/finances/enterprise/entities/transaction'
import { makeCategory } from 'test/unit/factories/make-category'
import { FinancialAnalyticsService } from '../services/financial-analytics/financial-analytics-service'

let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository
let categoriesRepository: ICategoriesRepository
let financialAnalyticsService: FinancialAnalyticsService

let sut: GetAccountSummariesByCategoriesUseCase

describe('Get account summaries by categories use case', () => {
  beforeEach(() => {
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()
    financialAnalyticsService = new FinancialAnalyticsService()

    sut = new GetAccountSummariesByCategoriesUseCase(
      accountsRepository,
      transactionsRepository,
      categoriesRepository,
      financialAnalyticsService
    )

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to get account summaries by categories', async () => {
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

    await categoriesRepository.create(
      makeCategory(
        {
          accountId: new UniqueEntityID('account-1'),
          name: 'Sport expenses',
        },
        new UniqueEntityID('category-2'),
      ),
    )

    await Promise.all(
      Array.from({ length: 2 }, () =>
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

    await Promise.all(
      Array.from({ length: 3 }, () =>
        transactionsRepository.create(
          makeTransaction({
            accountId: new UniqueEntityID('account-1'),
            categoryId: new UniqueEntityID('category-2'),
            amount: 25,
            operation: TransactionOperation.EXPENSE,
          }),
        ),
      ),
    )

    const result = await sut.execute({
      memberId: 'member-1',
      interval: {
        startDate: new Date(2025, 0, 12),
        endDate: new Date(2025, 0, 14),
      }
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.fromCategoriesSummaries).toHaveLength(2)
      expect(result.value.fromCategoriesSummaries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            categoryId: new UniqueEntityID('category-1'),
            totals: {
              income: 100,
              expense: 0
            },
            netBalance: 100
          }),
          expect.objectContaining({
            categoryId: new UniqueEntityID('category-2'),
            totals: {
              income: 0,
              expense: 75
            },
            netBalance: -75
          })
        ])
      )
    }
  })
})
