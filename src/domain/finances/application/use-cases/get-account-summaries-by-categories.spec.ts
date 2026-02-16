import { IMembersRepository } from '../repositories/members-repository'
import { InMemoryMembersRepository } from 'test/repositories/in-memory-members-repository'
import { makeMember } from 'test/factories/make-member'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { GetAccountSummariesByCategoriesUseCase } from './get-account-summaries-by-categories'
import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository'
import { makeAccount } from 'test/factories/make-account'
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions-repository'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-category-repository'
import { makeTransaction } from 'test/factories/make-transaction'
import { TransactionOperation } from '@/domain/finances/enterprise/entites/transaction'
import { makeCategory } from 'test/factories/make-category'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository
let categoriesRepository: ICategoriesRepository

let sut: GetAccountSummariesByCategoriesUseCase

describe('Get account summaries by categories use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new GetAccountSummariesByCategoriesUseCase(
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

  it('should be able to get account summaries by categories', async () => {
    vi.setSystemTime(new Date(2025, 0, 13))

    await membersRepository.create(
      await makeMember({}, new UniqueEntityID('member-1')),
    )

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
      startDate: new Date(2025, 0, 12),
      endDate: new Date(2025, 0, 14),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.byCategoriesSummaries).toHaveLength(2)
      expect(result.value.byCategoriesSummaries[0].netBalance).toBe(100)
      expect(result.value.byCategoriesSummaries[0].categoryId?.toString()).toBe(
        'category-1',
      )
      expect(result.value.byCategoriesSummaries[1].netBalance).toBe(-75)
      expect(result.value.byCategoriesSummaries[1].categoryId?.toString()).toBe(
        'category-2',
      )

      expect(result.value.byCategoriesSummaries[0].percentages).toMatchObject(
        {
          totalIncomePercentage: expect.any(Number),
          totalExpensePercentage: expect.any(Number)
        }
      )

      expect(result.value.byCategoriesSummaries[1].percentages).toMatchObject(
        {
          totalIncomePercentage: expect.any(Number),
          totalExpensePercentage: expect.any(Number)
        }
      )
    }
  })
})
