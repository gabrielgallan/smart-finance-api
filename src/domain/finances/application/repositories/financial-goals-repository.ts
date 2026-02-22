import { FinancialGoal } from '../../enterprise/entities/financial-goal'

export abstract class IFinancialGoalsRepository {
  abstract create(financialGoal: FinancialGoal): Promise<void>
}