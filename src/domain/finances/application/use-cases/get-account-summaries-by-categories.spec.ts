import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { makeMember } from 'tests/factories/make-member.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { GetAccountSummariesByCategoriesUseCase } from './get-account-summaries-by-categories.ts'
import { InMemoryAccountsRepository } from 'tests/repositories/in-memory-accounts-repository.ts'
import { makeAccount } from 'tests/factories/make-account.ts'
import { InMemoryTransactionsRepository } from 'tests/repositories/in-memory-transactions-repository.ts'
import { ITransactionsRepository } from '../repositories/transactions-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { ICategoriesRepository } from '../repositories/categories-repository.ts'
import { InMemoryCategoriesRepository } from 'tests/repositories/in-memory-category-repository.ts'
import { makeTransaction } from 'tests/factories/make-transaction.ts'
import { TransactionOperation } from '@/domain/finances/enterprise/entites/transaction.ts'
import { makeCategory } from 'tests/factories/make-category.ts'

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
      expect(result.value.categoriesSummaries).toHaveLength(2)
      expect(result.value.categoriesSummaries[0].netBalance).toBe(100)
      expect(result.value.categoriesSummaries[0].categoryId?.toString()).toBe(
        'category-1',
      )
      expect(result.value.categoriesSummaries[1].netBalance).toBe(-75)
      expect(result.value.categoriesSummaries[1].categoryId?.toString()).toBe(
        'category-2',
      )

      expect(result.value.categoriesSummaries[0].percentages).toMatchObject(
        {
          incomePercentage: expect.any(Number),
          expensePercentage: expect.any(Number)
        }
      )

      expect(result.value.categoriesSummaries[1].percentages).toMatchObject(
        {
          incomePercentage: expect.any(Number),
          expensePercentage: expect.any(Number)
        }
      )
    }
  })
})
