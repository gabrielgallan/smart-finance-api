import { FinancialGoal } from '../../enterprise/entites/financial-goal'

export abstract class IFinancialGoalsRepository {
  abstract create(financialGoal: FinancialGoal): Promise<void>
}