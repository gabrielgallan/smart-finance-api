import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { FinancialGoal } from '../../enterprise/entities/financial-goal'
import { IFinancialGoalsRepository } from '../repositories/financial-goals-repository'
import dayjs from 'dayjs'
import { InvalidPeriodError } from './errors/invalid-period-error'
import { InvalidPositiveNumberError } from '@/core/errors/invalid-positive-number-error'

interface CreateFinancialGoalUseCaseRequest {
  memberId: string
  title: string
  description?: string
  targetAmount: number
  targetDate: Date
}

type CreateFinancialGoalUseCaseResponse = Either<
  | ResourceNotFoundError
  | MemberAccountNotFoundError
  | InvalidPeriodError
  | InvalidPositiveNumberError,
  {
    financialGoal: FinancialGoal
  }
>

export class CreateFinancialGoalUseCase {
  constructor(
    private accountsRepository: IAccountsRepository,
    private financialGoalsRepository: IFinancialGoalsRepository
  ) { }

  async execute({
    memberId,
    title,
    description,
    targetAmount,
    targetDate
  }: CreateFinancialGoalUseCaseRequest): Promise<CreateFinancialGoalUseCaseResponse> {
    const targetDateJS = dayjs(targetDate)

    if (targetDateJS.isBefore(dayjs())) {
      return left(new InvalidPeriodError())
    }

    if (targetAmount <= 0) {
      return left(new InvalidPositiveNumberError())
    }

    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    const financialGoal = FinancialGoal.create({
      accountId: account.id,
      title,
      description,
      targetAmount,
      targetDate
    })

    await this.financialGoalsRepository.create(financialGoal)

    return right({
      financialGoal,
    })
  }
}
