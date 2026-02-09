import { RegisterMemberUseCase } from "@/domain/finances/application/use-cases/register-member"
import { InMemoryAccountsRepository } from "./repositories/in-memory-accounts-repository"
import { InMemoryCategoriesRepository } from "./repositories/in-memory-category-repository"
import { InMemoryMembersRepository } from "./repositories/in-memory-members-repository"
import { InMemoryTransactionsRepository } from "./repositories/in-memory-transactions-repository"
import { OpenAccountUseCase } from "@/domain/finances/application/use-cases/open-account"
import { CreateAccountCategoryUseCase } from "@/domain/finances/application/use-cases/create-account-category"
import { CreateTransactionUseCase } from "@/domain/finances/application/use-cases/create-transaction"
import { GetAccountSummaryByIntervalUseCase } from "@/domain/finances/application/use-cases/get-account-summary-by-interval"
import { GetAccountSummariesByCategoriesUseCase } from "@/domain/finances/application/use-cases/get-account-summaries-by-categories"
import { FetchRecentAccountTransactionsUseCase } from "@/domain/finances/application/use-cases/list-recent-account-transactions"
import { FetchAccountTransactionsByCategoryUseCase } from "@/domain/finances/application/use-cases/list-account-transactions-by-category"

const membersRepository = new InMemoryMembersRepository()
const accountsRepository = new InMemoryAccountsRepository()
const categoriesRepository = new InMemoryCategoriesRepository()
const transactionsRepository = new InMemoryTransactionsRepository()


const register = new RegisterMemberUseCase(
    membersRepository
)

const openAccount = new OpenAccountUseCase(
    membersRepository,
    accountsRepository
)

const createCategory = new CreateAccountCategoryUseCase(
    membersRepository,
    accountsRepository,
    categoriesRepository
)

const createTransaction = new CreateTransactionUseCase(
    membersRepository,
    accountsRepository,
    transactionsRepository,
    categoriesRepository
)

const getSummaryByInterval = new GetAccountSummaryByIntervalUseCase(
    membersRepository,
    accountsRepository,
    transactionsRepository
)

const getSummaryByCategories = new GetAccountSummariesByCategoriesUseCase(
    membersRepository,
    accountsRepository,
    transactionsRepository,
    categoriesRepository
)

const fetchRecentTransactions = new FetchRecentAccountTransactionsUseCase(
    membersRepository,
    accountsRepository,
    transactionsRepository
)

const fetchTransactionsByCategory = new FetchAccountTransactionsByCategoryUseCase(
    membersRepository,
    accountsRepository,
    transactionsRepository,
    categoriesRepository
)

const member = await register.execute({
    name: 'John Doe',
    birthDate: new Date(2005, 9, 31),
    document: '54021528881',
    email: 'johndoe@email.com',
    password: 'Johndoe123'
})

if (member.isLeft()) {
    throw new Error()
}

// console.log(member.value.member)

const account = await openAccount.execute({
    memberId: member.value.member.id.toString()
})

if (account.isLeft()) {
    throw new Error()
}

// console.log(account.value.account)

const category1 = await createCategory.execute({
    memberId: member.value.member.id.toString(),
    categoryName: 'Sports',
    categoryDescription: 'my sports expenses'
})

const category2 = await createCategory.execute({
    memberId: member.value.member.id.toString(),
    categoryName: 'Transports',
})

if (category1.isLeft() || category2.isLeft()) {
    throw new Error()
}

// console.log(category1.value.category)

const transaction = await createTransaction.execute({
    memberId: member.value.member.id.toString(),
    categoryId: category1.value.category.id.toString(),
    title: 'New transaction',
    description: 'new transaction test',
    amount: 70,
    operation: 'income',
    method: 'credit'
})

await createTransaction.execute({
    memberId: member.value.member.id.toString(),
    categoryId: category1.value.category.id.toString(),
    title: 'New transaction',
    description: 'new transaction test',
    amount: 35.50,
    operation: 'expense',
    method: 'credit'
})

await createTransaction.execute({
    memberId: member.value.member.id.toString(),
    categoryId: category2.value.category.id.toString(),
    title: 'New transaction',
    description: 'new transaction test',
    amount: 159.90,
    operation: 'income',
    method: 'credit'
})

if (transaction.isLeft()) {
    throw new Error()
}

// console.log(transaction.value.transaction)

const startDate = new Date(2026, 1, 1)
const endDate = new Date(2026, 1, 28)

const summary = await getSummaryByInterval.execute({
    memberId: member.value.member.id.toString(),
    startDate,
    endDate
})

if (summary.isLeft()) {
    throw new Error()
}

const summaryByCategories = await getSummaryByCategories.execute({
    memberId: member.value.member.id.toString(),
    startDate,
    endDate
})

if (summaryByCategories.isLeft()) {
    throw new Error()
}

summaryByCategories.value.categoriesSummaries.forEach(async sum => {
    sum.setPercentages(summary.value.accountSummary)

    console.log(sum)
})

// console.log(summaryByCategories.value.categoriesSummaries)