import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from 'test/repositories/in-memory-members-repository.ts'
import { makeMember } from 'test/factories/make-member.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { makeAccount } from 'test/factories/make-account.ts'
import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository.ts'
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions-repository.ts'
import { ITransactionsRepository } from '../repositories/transactions-repository.ts'
import { makeTransaction } from 'test/factories/make-transaction.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { GetRollingMonthProgressUseCase } from './get-rolling-month-progress.ts'
import { TransactionOperation } from '../../enterprise/entites/transaction.ts'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository

let sut: GetRollingMonthProgressUseCase

describe('Get rolling month progress use case', () => {
    beforeEach(() => {
        membersRepository = new InMemoryMembersRepository()
        accountsRepository = new InMemoryAccountsRepository()
        transactionsRepository = new InMemoryTransactionsRepository()

        sut = new GetRollingMonthProgressUseCase(
            accountsRepository,
            transactionsRepository,
        )

        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should be able to get a rolling month summary categorized by weeks', async () => {
        vi.setSystemTime(new Date(2026, 0, 5))

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
                createdAt: new Date(2026, 0, 31),
            }),
        )

        await transactionsRepository.create(
            makeTransaction({
                accountId: new UniqueEntityID('account-1'),
                createdAt: new Date(2025, 1, 21),
            }),
        )

        await transactionsRepository.create(
            makeTransaction({
                accountId: new UniqueEntityID('account-1'),
                amount: 100,
                operation: TransactionOperation.EXPENSE,
                createdAt: new Date(2026, 1, 17),
            }),
        )

        vi.setSystemTime(new Date(2026, 1, 25))

        const result = await sut.execute({
            memberId: 'member-1',
        })

        expect(result.isRight()).toBe(true)

        if (result.isRight()) {
            expect(result.value.rollingWeeksSummaries).toHaveLength(4)
            expect(result.value.rollingWeeksSummaries).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        summary: expect.objectContaining({
                            totalExpense: 100,
                        }),
                    }),
                ])
            )
        }
    })
})