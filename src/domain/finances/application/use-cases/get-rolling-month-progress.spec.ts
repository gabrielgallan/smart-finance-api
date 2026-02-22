import { IAccountsRepository } from '../repositories/accounts-repository'
import { makeAccount } from 'test/factories/make-account'
import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository'
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions-repository'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { makeTransaction } from 'test/factories/make-transaction'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { GetRollingMonthProgressUseCase } from './get-rolling-month-progress'
import { TransactionOperation } from '../../enterprise/entities/transaction'

let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository

let sut: GetRollingMonthProgressUseCase

describe('Get rolling month progress use case', () => {
    beforeEach(() => {
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