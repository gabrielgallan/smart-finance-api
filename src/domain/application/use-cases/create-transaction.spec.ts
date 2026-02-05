import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { ResourceNotFoundError } from './errors/resource-not-found-error.ts'
import { makeMember } from 'tests/factories/make-member.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { ITransactionsRepository } from '../repositories/transactions-repository.ts'
import { CreateTransactionUseCase } from './create-transaction.ts'
import { InMemoryAccountsRepository } from 'tests/repositories/in-memory-accounts-repository.ts'
import { InMemoryTransactionsRepository } from 'tests/repositories/in-memory-transactions-repository.ts'
import { makeAccount } from 'tests/factories/make-account.ts'
import { Transaction } from '@/domain/enterprise/entites/transaction.ts'
import { InMemoryCategoriesRepository } from 'tests/repositories/in-memory-category-repository.ts'
import { ICategoriesRepository } from '../repositories/categories-repository.ts'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error.ts'
import { makeCategory } from 'tests/factories/make-category.ts'
import { InvalidCategoryAccountRelationError } from './errors/invalid-category-account-relation-error.ts'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository
let categoriesRepository: ICategoriesRepository

let sut: CreateTransactionUseCase

describe('Create transaction use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new CreateTransactionUseCase(
      membersRepository,
      accountsRepository,
      transactionsRepository,
      categoriesRepository,
    )
  })

  it('should be able to create a income transaction', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const account = await makeAccount({
      holderId: member.id,
      balance: 0,
    })
    await accountsRepository.create(account)

    const result = await sut.execute({
      memberId: member.id.toString(),
      title: 'Month Salary',
      description: 'month salary of January',
      amount: 2000,
      operation: 'income',
      method: 'credit',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.transaction.isIncome()).toBe(true)
      expect(result.value.transaction.amount).toBe(2000)
      expect(account.balance).toBe(2000)
    }
  })

  it('should be able to create a expense transaction', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const account = await makeAccount({
      holderId: member.id,
      balance: 0,
    })
    await accountsRepository.create(account)

    const result = await sut.execute({
      memberId: member.id.toString(),
      title: 'Pay debt',
      amount: 400,
      operation: 'expense',
      method: 'debit',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.transaction).toBeInstanceOf(Transaction)
      expect(result.value.transaction.isExpense()).toBe(true)
      expect(result.value.transaction.amount).toBe(400)
      expect(account.balance).toBe(-400)
    }
  })

  it('should be able to create both transactions', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const account = await makeAccount({
      holderId: member.id,
      balance: 0,
    })
    await accountsRepository.create(account)

    const incomeResult = await sut.execute({
      memberId: member.id.toString(),
      title: 'Month Salary',
      amount: 2000,
      operation: 'income',
    })

    expect(account.balance).toBe(2000)

    const expenseResult = await sut.execute({
      memberId: member.id.toString(),
      title: 'Pay Account Debt',
      amount: 450.55,
      operation: 'expense',
    })

    expect(incomeResult.isRight()).toBe(true)
    expect(expenseResult.isRight()).toBe(true)

    if (incomeResult.isRight() && expenseResult.isRight()) {
      expect(incomeResult.value.transaction.isIncome()).toBe(true)
      expect(expenseResult.value.transaction.isExpense()).toBe(true)

      expect(incomeResult.value.transaction.amount).toBe(2000)
      expect(expenseResult.value.transaction.amount).toBe(450.55)

      expect(account.balance).toBe(1549.45)
    }
  })

  it('should not be able to create transactions from a member does not exists', async () => {
    const result = await sut.execute({
      memberId: 'non-existing-member',
      title: 'Pay Account Debt',
      amount: 450.55,
      operation: 'expense',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create transactions from a member does not have account', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const result = await sut.execute({
      memberId: member.id.toString(),
      title: 'Pay Account Debt',
      amount: 450.55,
      operation: 'expense',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(MemberAccountNotFoundError)
  })

  it('should be able to create transactions from a category', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const account = await makeAccount({
      holderId: member.id,
      balance: 100,
    })
    await accountsRepository.create(account)

    const category = await makeCategory({
      accountId: account.id,
      name: 'Transport',
    })
    await categoriesRepository.create(category)

    const result = await sut.execute({
      memberId: member.id.toString(),
      categoryId: category.id.toString(),
      title: 'Uber',
      amount: 25.9,
      operation: 'expense',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.transaction.isExpense()).toBe(true)
      expect(result.value.transaction.amount).toBe(25.9)
      expect(account.balance).toBe(74.1)
      expect(result.value.transaction.categoryId).toStrictEqual(category.id)
    }
  })

  it('should not be able to create transactions from a category of another account', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const account = await makeAccount({
      holderId: member.id,
    })
    await accountsRepository.create(account)

    const category = await makeCategory()
    await categoriesRepository.create(category)

    const result = await sut.execute({
      memberId: member.id.toString(),
      categoryId: category.id.toString(),
      title: 'Uber',
      amount: 25.9,
      operation: 'expense',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCategoryAccountRelationError)
  })
})
