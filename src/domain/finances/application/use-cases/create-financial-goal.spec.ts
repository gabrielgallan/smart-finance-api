import { IMembersRepository } from '../repositories/members-repository'
import { InMemoryMembersRepository } from 'test/repositories/in-memory-members-repository'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository'
import { makeMember } from 'test/factories/make-member'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeAccount } from 'test/factories/make-account'
import { IFinancialGoalsRepository } from '../repositories/financial-goals-repository'
import { CreateFinancialGoalUseCase } from './create-financial-goal'
import { InMemoryFinancialGoalsRepository } from 'test/repositories/in-memory-financial-goals-repository'

let membersRepository: IMembersRepository
let accountRepository: IAccountsRepository
let financialGoalsRepository: IFinancialGoalsRepository

let sut: CreateFinancialGoalUseCase

describe('Create financial goal use case', () => {
    beforeEach(() => {
        membersRepository = new InMemoryMembersRepository()
        accountRepository = new InMemoryAccountsRepository()
        financialGoalsRepository = new InMemoryFinancialGoalsRepository()

        sut = new CreateFinancialGoalUseCase(
            membersRepository,
            accountRepository,
            financialGoalsRepository
        )

        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should be able to create a account financial goal', async () => {
        vi.setSystemTime(new Date(2026, 1, 9))

        await membersRepository.create(
            await makeMember({}, new UniqueEntityID('member-1')),
        )

        await accountRepository.create(
            makeAccount({
                holderId: new UniqueEntityID('member-1')
            }, new UniqueEntityID('account-1'))
        )

        const result = await sut.execute({
            memberId: 'member-1',
            title: 'Mercedes Benz',
            description: 'Budget to buy mercedes benz',
            targetAmount: 130000,
            targetDate: new Date(2027, 0, 31)
        })

        expect(result.isRight()).toBe(true)

        if (result.isRight()) {
            expect(result.value.financialGoal.accountId.toString()).toBe('account-1')
            expect(result.value.financialGoal.targetAmount).toBe(130000)
            expect(result.value.financialGoal.targetDate).toEqual(new Date(2027, 0, 31))
        }
    })
})
