import { CreateTransactionUseCase } from './create-transaction'
import { InMemoryAccountsRepository } from 'test/unit/repositories/in-memory-accounts-repository'
import { InMemoryTransactionsRepository } from 'test/unit/repositories/in-memory-transactions-repository'
import { makeAccount } from 'test/unit/factories/make-account'
import { InMemoryCategoriesRepository } from 'test/unit/repositories/in-memory-category-repository'
import { makeCategory } from 'test/unit/factories/make-category'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { InvalidPositiveNumberError } from '@/core/errors/invalid-positive-number-error'

let accountsRepository: InMemoryAccountsRepository
let transactionsRepository: InMemoryTransactionsRepository
let categoriesRepository: InMemoryCategoriesRepository

let sut: CreateTransactionUseCase

describe('Create transaction use case', () => {
  beforeEach(() => {
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new CreateTransactionUseCase(
      accountsRepository,
      transactionsRepository,
      categoriesRepository,
    )
  })

  it('should be able to create transactions', async () => {
    await accountsRepository.create(
      makeAccount({
        holderId: new UniqueEntityID('member-1'),
        balance: 0,
      }, new UniqueEntityID('member-1'))
    )

    const incomeResult = await sut.execute({
      memberId: 'member-1',
      title: 'Month Salary',
      amount: 2000,
      operation: 'income',
    })

    expect(accountsRepository.items[0].balance).toBe(2000)

    const expenseResult = await sut.execute({
      memberId: 'member-1',
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

      expect(accountsRepository.items[0].balance).toBe(1549.45)
    }
  })

  it('should be able to create transactions from a category', async () => {
    await accountsRepository.create(
      makeAccount({
        holderId: new UniqueEntityID('member-1'),
        balance: 100,
      },
        new UniqueEntityID('account-1'),
      )
    )

    await categoriesRepository.create(
      makeCategory(
        {
          accountId: new UniqueEntityID('account-1'),
          name: 'Transport',
        },
        new UniqueEntityID('category-1'),
      ),
    )

    const result = await sut.execute({
      memberId: 'member-1',
      categoryId: 'category-1',
      title: 'Uber',
      amount: 25.9,
      operation: 'expense',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.transaction.isExpense()).toBe(true)
      expect(result.value.transaction.amount).toBe(25.9)
      expect(accountsRepository.items[0].balance).toBe(74.1)
      expect(result.value.transaction.categoryId?.toString()).toBe('category-1')
    }
  })

  it('should not be able to create transactions from a category of another account', async () => {
    await accountsRepository.create(
      makeAccount(
        {
          holderId: new UniqueEntityID('member-1'),
        },
        new UniqueEntityID('account-1'),
      ),
    )

    await categoriesRepository.create(
      makeCategory({
        accountId: new UniqueEntityID('another-account-id')
      }, new UniqueEntityID('category-1')),
    )

    const result = await sut.execute({
      memberId: 'member-1',
      categoryId: 'category-1',
      title: 'Uber',
      amount: 25.9,
      operation: 'expense',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create a transaction with negative amount', async () => {
    const result = await sut.execute({
      memberId: 'member-1',
      categoryId: 'category-1',
      title: 'Uber',
      amount: -25.9,
      operation: 'expense',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidPositiveNumberError)
  })
})
