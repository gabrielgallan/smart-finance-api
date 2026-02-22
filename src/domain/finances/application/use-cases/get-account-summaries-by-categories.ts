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
import { AccountSummaryCalculator } from '../services/account-summary-calculator'

interface GetAccountSummariesByCategoriesUseCaseRequest {
  memberId: string
  interval: DateInterval
}

type GetAccountSummariesByCategoriesUseCaseResponse = Either<
  | ResourceNotFoundError
  | MemberAccountNotFoundError
  | AnyCategoryFoundForAccountError
  | InvalidPeriodError,
  {
    fullTermAccounSummary: AccountSummary
    fromCategoriesSummaries: AccountSummary[]
  }
>

export class GetAccountSummariesByCategoriesUseCase {
  constructor(
    private accountsRepository: IAccountsRepository,
    private transactionsRepository: ITransactionsRepository,
    private categoriesRepository: ICategoriesRepository,
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

    const allTransactions = await this.transactionsRepository.findManyByQuery({
      accountId: account.id.toString(),
      interval
    })

    const allTransactionsSummary = AccountSummaryCalculator.calculate({
      accountId: account.id,
      interval,
      transactions: allTransactions
    })

    const fromCategoriesSummaries: AccountSummary[] = []

    for (const category of categories) {
      const transactionsByCategory =
        await this.transactionsRepository.findManyByQuery({
          accountId: account.id.toString(),
          categoryId: category.id.toString(),
          interval
        })

      const categorySummary = AccountSummaryCalculator.calculate({
        accountId: account.id,
        categoryId: category.id,
        interval,
        transactions: transactionsByCategory
      })

      categorySummary.setComparativePercentages(allTransactionsSummary)

      fromCategoriesSummaries.push(categorySummary)
    }

    return right({
      fullTermAccounSummary: allTransactionsSummary,
      fromCategoriesSummaries,
    })
  }
}