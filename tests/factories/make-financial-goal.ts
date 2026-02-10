import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { FinancialGoal, FinancialGoalProps } from '@/domain/finances/enterprise/entites/financial-goal'
import { faker } from '@faker-js/faker'

export function makeFinancialGoal(
    override: Partial<FinancialGoalProps> = {},
    id?: UniqueEntityID
) {
    const financialGoal = FinancialGoal.create({
        accountId: new UniqueEntityID(),
        title: faker.lorem.sentence(1),
        targetAmount: faker.number.int({ min: 0, max: 99999 }),
        targetDate: new Date(),
        ...override
    }, id)

    return financialGoal
}