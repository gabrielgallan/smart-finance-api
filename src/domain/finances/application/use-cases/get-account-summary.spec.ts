import { IAccountsRepository } from '../repositories/accounts-repository'
import { GetAccountSummaryUseCase } from './get-account-summary'
import { InMemoryAccountsRepository } from 'test/unit/repositories/in-memory-accounts-repository'
import { makeAccount } from 'test/unit/factories/make-account'
import { InMemoryTransactionsRepository } from 'test/unit/repositories/in-memory-transactions-repository'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeTransaction } from 'test/unit/factories/make-transaction'
import { TransactionOperation } from '@/domain/finances/enterprise/entities/transaction'

let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository

let sut: GetAccountSummaryUseCase

describe('Get account summary by interval use case', () => {
  beforeEach(() => {
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()

    sut = new GetAccountSummaryUseCase(
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
      interval: {
        startDate: new Date(2025, 0, 12),
        endDate: new Date(2025, 0, 14),
      }
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.summary.netBalance).toBe(-45)
      expect(result.value.summary.totals.expense).toBe(45)
      expect(result.value.summary.totals.income).toBe(0)
      expect(result.value.summary.counts.transactions).toBe(1)
    }
  })
})
