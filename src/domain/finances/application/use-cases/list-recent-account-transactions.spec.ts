import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from 'test/repositories/in-memory-members-repository.ts'
import { makeMember } from 'test/factories/make-member.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { makeAccount } from 'test/factories/make-account.ts'
import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository.ts'
import { ListRecentAccountTransactionsUseCase } from './list-recent-account-transactions.ts'
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions-repository.ts'
import { ITransactionsRepository } from '../repositories/transactions-repository.ts'
import { makeTransaction } from 'test/factories/make-transaction.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository

let sut: ListRecentAccountTransactionsUseCase

describe('List recent account transactions use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()

    sut = new ListRecentAccountTransactionsUseCase(
      membersRepository,
      accountsRepository,
      transactionsRepository,
    )
  })

  it('should be able to List recent account transactions', async () => {
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
        accountId: new UniqueEntityID('account-1'),
        createdAt: new Date(2025, 6, 25),
      }),
    )

    await transactionsRepository.create(
      makeTransaction({
        accountId: new UniqueEntityID('account-1'),
        createdAt: new Date(2025, 6, 30),
      }),
    )

    const result = await sut.execute({
      memberId: 'member-1',
      limit: 10,
      page: 1,
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.transactions).toEqual([
        expect.objectContaining({ createdAt: new Date(2025, 6, 30) }),
        expect.objectContaining({ createdAt: new Date(2025, 6, 25) }),
        expect.objectContaining({ createdAt: new Date(2025, 6, 23) }),
      ])
    }
  })

  it('should be able to List recent account transactions filtered by pagination', async () => {
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
      Array.from({ length: 15 }, () =>
        transactionsRepository.create(
          makeTransaction({
            accountId: new UniqueEntityID('account-1'),
          }),
        ),
      ),
    )

    const result = await sut.execute({
      memberId: 'member-1',
      limit: 10,
      page: 2,
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.transactions).toHaveLength(5)
    }
  })
})
