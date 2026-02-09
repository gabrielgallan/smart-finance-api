import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { InMemoryAccountsRepository } from 'tests/repositories/in-memory-accounts-repository.ts'
import { makeMember } from 'tests/factories/make-member.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { makeAccount } from 'tests/factories/make-account.ts'
import { IFinancialGoalsRepository } from '../repositories/financial-goals-repository.ts'
import { CreateFinancialGoalUseCase } from './create-financial-goal.ts'
import { InMemoryFinancialGoalsRepository } from 'tests/repositories/in-memory-financial-goals-repository.ts'

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
