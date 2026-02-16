import { IMembersRepository } from '../repositories/members-repository'
import { InMemoryMembersRepository } from 'test/repositories/in-memory-members-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { makeMember } from 'test/factories/make-member'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { CreateTransactionUseCase } from './create-transaction'
import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository'
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions-repository'
import { makeAccount } from 'test/factories/make-account'
import { Transaction } from '@/domain/finances/enterprise/entites/transaction'
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-category-repository'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { makeCategory } from 'test/factories/make-category'
import { InvalidCategoryAccountRelationError } from './errors/invalid-category-account-relation-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

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
    await membersRepository.create(
      await makeMember({}, new UniqueEntityID('member-1')),
    )

    const result = await sut.execute({
      memberId: 'member-1',
      title: 'Pay Account Debt',
      amount: 450.55,
      operation: 'expense',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(MemberAccountNotFoundError)
  })

  it('should be able to create transactions from a category', async () => {
    await membersRepository.create(
      await makeMember({}, new UniqueEntityID('member-1')),
    )

    const account = makeAccount(
      {
        holderId: new UniqueEntityID('member-1'),
        balance: 100,
      },
      new UniqueEntityID('account-1'),
    )

    await accountsRepository.create(account)

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
      expect(account.balance).toBe(74.1)
      expect(result.value.transaction.categoryId?.toString()).toBe('category-1')
    }
  })

  it('should not be able to create transactions from a category of another account', async () => {
    await membersRepository.create(
      await makeMember({}, new UniqueEntityID('member-1')),
    )

    await accountsRepository.create(
      makeAccount(
        {
          holderId: new UniqueEntityID('member-1'),
        },
        new UniqueEntityID('account-1'),
      ),
    )

    await categoriesRepository.create(
      makeCategory({}, new UniqueEntityID('category-1')),
    )

    const result = await sut.execute({
      memberId: 'member-1',
      categoryId: 'category-1',
      title: 'Uber',
      amount: 25.9,
      operation: 'expense',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCategoryAccountRelationError)
  })
})
