import { FinancialGoal } from '../../enterprise/entites/financial-goal'

export interface IFinancialGoalsRepository {
  create(financialGoal: FinancialGoal): Promise<void>
}