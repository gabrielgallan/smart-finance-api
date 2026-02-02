import { Member } from '../../enterprise/entites/member.ts'
import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { AuthenticateMemberUseCase } from './authenticate-member.ts'
import { Hash } from '@/domain/enterprise/entites/value-objects/hash.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { ResourceNotFoundError } from './errors/resource-not-found-error.ts'
import { InvalidCredentialsError } from './errors/invalid-credentials-error.ts'
import { makeMember } from 'tests/factories/make-member.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { ITransactionsRepository } from '../repositories/transactions-repository.ts'
import { CreateTransactionUseCase } from './create-transaction.ts'
import { InMemoryAccountsRepository } from 'tests/repositories/in-memory-accounts-repository.ts'
import { InMemoryTransactionsRepository } from 'tests/repositories/in-memory-transactions-repository.ts'
import { makeAccount } from 'tests/factories/make-account.ts'
import { Transaction } from '@/domain/enterprise/entites/transaction.ts'
import { MemberNotAllowedError } from './errors/member-not-allowed-error.ts'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository

let sut: CreateTransactionUseCase

describe('Create transaction use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()

    sut = new CreateTransactionUseCase(
        membersRepository,
        accountsRepository,
        transactionsRepository
    )
  })

  it('should be able to create a income transaction', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const account = await makeAccount({
        holderId: member.id,
        balance: 0
    })
    await accountsRepository.create(account)

    const result = await sut.execute({
        memberId: member.id.toString(),
        accountId: account.id.toString(),
        title: 'Month Salary',
        description: 'month salary of January',
        amount: 2000,
        operation: 'INCOME',
        method: 'CREDIT_CARD'
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.transaction).toBeInstanceOf(Transaction)
      expect(result.value.transaction.isIncome()).toBe(true)
      expect(result.value.transaction.amount).toBe(2000)
      expect(result.value.transaction.method.value).toBe('CREDIT_CARD')
      expect(account.balance).toBe(2000)
    }
  })

  it('should be able to create a expense transaction', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const account = await makeAccount({
        holderId: member.id,
        balance: 0
    })
    await accountsRepository.create(account)

    const result = await sut.execute({
        memberId: member.id.toString(),
        accountId: account.id.toString(),
        title: 'Pay debt',
        amount: 400,
        operation: 'EXPENSE',
        method: 'DEBIT_CARD'
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.transaction).toBeInstanceOf(Transaction)
      expect(result.value.transaction.isExpense()).toBe(true)
      expect(result.value.transaction.amount).toBe(400)
      expect(result.value.transaction.method.value).toBe('DEBIT_CARD')
      expect(account.balance).toBe(-400)
    }
  })

  it('should be able to create both transactions', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const account = await makeAccount({
        holderId: member.id,
        balance: 0
    })
    await accountsRepository.create(account)

    const incomeResult = await sut.execute({
        memberId: member.id.toString(),
        accountId: account.id.toString(),
        title: 'Month Salary',
        amount: 2000,
        operation: 'INCOME',
        method: 'PIX'
    })

    expect(account.balance).toBe(2000)

    const expenseResult = await sut.execute({
        memberId: member.id.toString(),
        accountId: account.id.toString(),
        title: 'Pay Account Debt',
        amount: 450.55,
        operation: 'EXPENSE',
    })

    expect(incomeResult.isRight()).toBe(true)
    expect(expenseResult.isRight()).toBe(true)

    if (incomeResult.isRight() && expenseResult.isRight()) {
      expect(incomeResult.value.transaction.isIncome()).toBe(true)
      expect(expenseResult.value.transaction.isExpense()).toBe(true)

      expect(incomeResult.value.transaction.amount).toBe(2000)
      expect(expenseResult.value.transaction.amount).toBe(450.55)

      expect(incomeResult.value.transaction.method.value).toBe('PIX')
      expect(expenseResult.value.transaction.method.value).toBe('UNKNOWN')

      expect(account.balance).toBe(1549.45)
    }
  })

  it('should not be able to create transactions from a member does not exists', async () => {
    const result = await sut.execute({
        memberId: 'non-existing-member',
        accountId: 'non-existing-account',
        title: 'Pay Account Debt',
        amount: 450.55,
        operation: 'EXPENSE',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create transactions from a account does not exists', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const result = await sut.execute({
        memberId: member.id.toString(),
        accountId: 'non-existing-account',
        title: 'Pay Account Debt',
        amount: 450.55,
        operation: 'EXPENSE'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create transactions from a different member to the account informed', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const account = await makeAccount({
        holderId: new UniqueEntityID('other-member'),
    })
    await accountsRepository.create(account)

    const result = await sut.execute({
        memberId: member.id.toString(),
        accountId: account.id.toString(),
        title: 'Pay Account Debt',
        amount: 450.55,
        operation: 'EXPENSE'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(MemberNotAllowedError)
  })
})
