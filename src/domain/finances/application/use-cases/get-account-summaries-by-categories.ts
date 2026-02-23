import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { InvalidPeriodError } from './errors/invalid-period-error'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { AnyCategoryFoundForAccountError } from './errors/any-category-found-for-account-error'
import { AccountSummary } from '../../enterprise/entities/value-objects/summaries/account-summary'
import { DateInterval } from '@/core/types/repositories/date-interval'
import { FinancialAnalyticsService } from '../services/financial-analytics/financial-analytics-service'
import { Injectable } from '@nestjs/common'

interface GetAccountSummariesByCategoriesUseCaseRequest {
  memberId: string
  interval: DateInterval
}

type GetAccountSummariesByCategoriesUseCaseResponse = Either<
  | ResourceNotFoundError
  | MemberAccountNotFoundError
  | AnyCategoryFoundForAccountError,
  {
    fullTermAccounSummary: AccountSummary
    fromCategoriesSummaries: AccountSummary[]
  }
>

@Injectable()
export class GetAccountSummariesByCategoriesUseCase {
  constructor(
    private accountsRepository: IAccountsRepository,
    private transactionsRepository: ITransactionsRepository,
    private categoriesRepository: ICategoriesRepository,
    private analyticsService: FinancialAnalyticsService,
  ) { }

  async execute({
    memberId,
    interval
  }: GetAccountSummariesByCategoriesUseCaseRequest): Promise<GetAccountSummariesByCategoriesUseCaseResponse> {
    const account = await this.accountsRepository.findByHolderId(memberId)

    if (!account) {
      return left(new MemberAccountNotFoundError())
    }

    const categories = await this.categoriesRepository.findManyByAccountId(
      account.id.toString(),
    )

    if (categories.length === 0) {
      return left(new AnyCategoryFoundForAccountError())
    }

    const transactions = await this.transactionsRepository.findManyByQuery({
      accountId: account.id.toString(),
      interval
    })

    const result = this.analyticsService.summarizeByCategories({
      accountId: account.id,
      categories,
      transactions,
      interval
    })

    return right({
      fullTermAccounSummary: result.totalSummary,
      fromCategoriesSummaries: result.partsSummaries,
    })
  }
}