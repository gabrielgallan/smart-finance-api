import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { InvalidPeriodError } from './errors/invalid-period-error'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { AccountSummary } from '../../enterprise/entities/value-objects/summaries/account-summary'
import { DateInterval } from '@/core/types/repositories/date-interval'
import { AccountSummaryCalculator } from '../services/account-summary-calculator'


interface GetAccountSummaryByCategoryUseCaseRequest {
  memberId: string
  categoryId: string
  interval: DateInterval
}

type GetAccountSummaryByCategoryUseCaseResponse = Either<
  | ResourceNotFoundError
  | MemberAccountNotFoundError
  | InvalidPeriodError,
  {
    fullTermAccountSummary: AccountSummary
    fromCategorySummary: AccountSummary
  }
>

export class GetAccountSummaryByCategoryUseCase {
  constructor(
    private accountsRepository: IAccountsRepository,
    private transactionsRepository: ITransactionsRepository,
    private categoriesRepository: ICategoriesRepository,
  ) { }

  async execute({
    memberId,
    categoryId,
    interval
  }: GetAccountSummaryByCategoryUseCaseRequest): Promise<GetAccountSummaryByCategoryUseCaseResponse> {
    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    const category = await this.categoriesRepository.findByIdAndAccountId(
      categoryId,
      account.id.toString()
    )

    if (!category) {
      return left(new ResourceNotFoundError())
    }

    const transactions = await this.transactionsRepository.findManyByQuery({
      accountId: account.id.toString(),
      interval,
    })

    const fullTermAccountSummary = AccountSummaryCalculator.calculate({
      accountId: account.id,
      interval,
      transactions: transactions
    })

    const transactionsFromCategory =
      await this.transactionsRepository.findManyByQuery({
        accountId: account.id.toString(),
        categoryId: category.id.toString(),
        interval,
      })

    const fromCategorySummary = AccountSummaryCalculator.calculate({
      accountId: account.id,
      categoryId: category.id,
      interval,
      transactions: transactionsFromCategory
    })

    fromCategorySummary.setComparativePercentages(fullTermAccountSummary)

    return right({
      fullTermAccountSummary,
      fromCategorySummary,
    })
  }
}
