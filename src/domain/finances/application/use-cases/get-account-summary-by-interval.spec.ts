import { IMembersRepository } from '../repositories/members-repository'
import { InMemoryMembersRepository } from 'test/repositories/in-memory-members-repository'
import { makeMember } from 'test/factories/make-member'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { GetAccountSummaryByIntervalUseCase } from './get-account-summary-by-interval'
import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository'
import { makeAccount } from 'test/factories/make-account'
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions-repository'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeTransaction } from 'test/factories/make-transaction'
import { TransactionOperation } from '@/domain/finances/enterprise/entites/transaction'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository

let sut: GetAccountSummaryByIntervalUseCase

describe('Get account summary by interval use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()

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

    const account = makeAccount(
      {
        holderId: new UniqueEntityID('member-1'),
        balance: 250,
      },
      new UniqueEntityID('account-1'),
    )

    await accountsRepository.create(account)

    await transactionsRepository.create(
      makeTransaction({
        accountId: new UniqueEntityID('account-1'),
        amount: 45,
        operation: TransactionOperation.EXPENSE,
      }),
    )

    account.withdraw(45)

    await accountsRepository.save(account)

    const result = await sut.execute({
      memberId: 'member-1',
      startDate: new Date(2025, 0, 12),
      endDate: new Date(2025, 0, 14),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.currentBalance).toBe(205)
      expect(result.value.accountSummary.netBalance).toBe(-45)
      expect(result.value.accountSummary.totalExpense).toBe(45)
      expect(result.value.accountSummary.totalIncome).toBe(0)
      expect(result.value.accountSummary.transactionsCount).toBe(1)
    }
  })
})
