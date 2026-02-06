import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { makeMember } from 'tests/factories/make-member.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { GetAccountSummaryByCategoryUseCase } from './get-account-summary-by-category.ts'
import { InMemoryAccountsRepository } from 'tests/repositories/in-memory-accounts-repository.ts'
import { makeAccount } from 'tests/factories/make-account.ts'
import { InMemoryTransactionsRepository } from 'tests/repositories/in-memory-transactions-repository.ts'
import { ITransactionsRepository } from '../repositories/transactions-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { ICategoriesRepository } from '../repositories/categories-repository.ts'
import { InMemoryCategoriesRepository } from 'tests/repositories/in-memory-category-repository.ts'
import { makeTransaction } from 'tests/factories/make-transaction.ts'
import { TransactionOperation } from '@/domain/finance-manager/enterprise/entites/transaction.ts'
import { makeCategory } from 'tests/factories/make-category.ts'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository
let categoriesRepository: ICategoriesRepository

let sut: GetAccountSummaryByCategoryUseCase

describe('Get account summary by category use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new GetAccountSummaryByCategoryUseCase(
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
      expect(
        result.value.accountSummaryByCategory.accountSummary.netBalance,
      ).toBe(150)
      expect(
        result.value.accountSummaryByCategory.accountSummary.transactionsCount,
      ).toBe(3)
      expect(result.value.accountSummaryByCategory.category.slug.value).toBe(
        'freelance-jobs',
      )
    }
  })
})
