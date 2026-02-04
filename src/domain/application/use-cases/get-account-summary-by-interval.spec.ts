import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { makeMember } from 'tests/factories/make-member.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { GetAccountSummaryByIntervalUseCase } from './get-account-summary-by-interval.ts'
import { InMemoryAccountsRepository } from 'tests/repositories/in-memory-accounts-repository.ts'
import { makeAccount } from 'tests/factories/make-account.ts'
import { InMemoryTransactionsRepository } from 'tests/repositories/in-memory-transactions-repository.ts'
import { ITransactionsRepository } from '../repositories/transactions-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { CreateTransactionUseCase } from './create-transaction.ts'
import { ICategoriesRepository } from '../repositories/categories-repository.ts'
import { InMemoryCategoriesRepository } from 'tests/repositories/in-memory-category-repository.ts'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository
let categoriesRepository: ICategoriesRepository

let sut: GetAccountSummaryByIntervalUseCase

describe('Fetch account summary use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new GetAccountSummaryByIntervalUseCase(
      membersRepository,
      accountsRepository,
      transactionsRepository,
    )

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to get account summary by time interval', async () => {
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

    await new CreateTransactionUseCase(
      membersRepository,
      accountsRepository,
      transactionsRepository,
      categoriesRepository,
    ).execute({
      memberId: 'member-1',
      title: 'transaction-1',
      amount: 45,
      operation: 'expense',
    })

    const result = await sut.execute({
      memberId: 'member-1',
      startDate: new Date(2025, 0, 12),
      endDate: new Date(2025, 0, 14),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.currentBalance).toBe(205)
      expect(result.value.periodNetBalance).toBe(-45)
      expect(result.value.totalExpense).toBe(45)
      expect(result.value.totalIncome).toBe(0)
      expect(result.value.transactionsCount).toBe(1)
    }
  })
})
