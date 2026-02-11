import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from 'test/repositories/in-memory-members-repository.ts'
import { makeMember } from 'test/factories/make-member.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { makeAccount } from 'test/factories/make-account.ts'
import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository.ts'
import { GetRollingYearProgressUseCase } from './get-rolling-yearly-progress.ts'
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions-repository.ts'
import { ITransactionsRepository } from '../repositories/transactions-repository.ts'
import { makeTransaction } from 'test/factories/make-transaction.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { TransactionOperation } from '../../enterprise/entites/transaction.ts'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository

let sut: GetRollingYearProgressUseCase

describe('Get rolling yearly progress use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()

    sut = new GetRollingYearProgressUseCase(
      accountsRepository,
      transactionsRepository,
    )

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to get a rolling year summary categorized by months', async () => {
    vi.setSystemTime(new Date(2025, 6, 10))

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

    await transactionsRepository.create(
      makeTransaction({
        accountId: new UniqueEntityID('account-1'),
        createdAt: new Date(2025, 6, 23),
      }),
    )

    await transactionsRepository.create(
      makeTransaction({
        amount: 179.9,
        accountId: new UniqueEntityID('account-1'),
        operation: TransactionOperation.INCOME,
        createdAt: new Date(2025, 9, 25),
      }),
    )

    await transactionsRepository.create(
      makeTransaction({
        accountId: new UniqueEntityID('account-1'),
        createdAt: new Date(2026, 0, 30),
      }),
    )

    vi.setSystemTime(new Date(2026, 0, 31))

    const result = await sut.execute({
      memberId: 'member-1',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.rollingMonthsSummaries).toHaveLength(12)
      expect(result.value.rollingMonthsSummaries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            period: {
              monthIndex: 10,
              year: 2025
            },
            summary: expect.objectContaining({
              totalIncome: 179.9,
            }),
          }),
        ])
      )
    }
  })
})
