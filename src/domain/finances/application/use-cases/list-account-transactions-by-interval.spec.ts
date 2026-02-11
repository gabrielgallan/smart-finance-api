import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from 'test/repositories/in-memory-members-repository.ts'
import { makeMember } from 'test/factories/make-member.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository.ts'
import { makeAccount } from 'test/factories/make-account.ts'
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions-repository.ts'
import { ITransactionsRepository } from '../repositories/transactions-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { ListAccountTransactionsByIntervalUseCase } from './list-account-transactions-by-interval.ts'
import { makeTransaction } from 'test/factories/make-transaction.ts'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository

let sut: ListAccountTransactionsByIntervalUseCase

describe('List account transactions by interval use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()

    sut = new ListAccountTransactionsByIntervalUseCase(
      membersRepository,
      accountsRepository,
      transactionsRepository,
    )

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to list account transactions by time interval', async () => {
    vi.setSystemTime(new Date(2025, 0, 15))

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

    await Promise.all(
      Array.from({ length: 6 }, () =>
        transactionsRepository.create(
          makeTransaction({
            accountId: new UniqueEntityID('account-1'),
          }),
        ),
      ),
    )

    vi.setSystemTime(new Date(2025, 1, 15))

    await Promise.all(
      Array.from({ length: 3 }, () =>
        transactionsRepository.create(
          makeTransaction({
            accountId: new UniqueEntityID('account-1'),
          }),
        ),
      ),
    )

    const januaryResults = await sut.execute({
      memberId: 'member-1',
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2025, 0, 31),
      limit: 10,
      page: 1,
    })

    const februaryResults = await sut.execute({
      memberId: 'member-1',
      startDate: new Date(2025, 1, 1),
      endDate: new Date(2025, 1, 28),
      limit: 10,
      page: 1,
    })

    expect(januaryResults.isRight()).toBe(true)
    expect(februaryResults.isRight()).toBe(true)

    if (januaryResults.isRight() && februaryResults.isRight()) {
      expect(januaryResults.value.transactions).toHaveLength(6)
      expect(februaryResults.value.transactions).toHaveLength(3)
    }
  })
})
