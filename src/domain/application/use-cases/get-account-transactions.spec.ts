import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { ResourceNotFoundError } from './errors/resource-not-found-error.ts'
import { makeMember } from 'tests/factories/make-member.ts'
import { ICategoriesRepository } from '../repositories/categories-repository.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { makeAccount } from 'tests/factories/make-account.ts'
import { InMemoryAccountsRepository } from 'tests/repositories/in-memory-accounts-repository.ts'
import { InMemoryCategoriesRepository } from 'tests/repositories/in-memory-category-repository.ts'
import { CreateAccountCategoryUseCase } from './create-account-category.ts'
import { Category } from '@/domain/enterprise/entites/category.ts'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error.ts'
import { CategoryAlreadyExistsError } from './errors/category-already-exists-error.ts'
import { GetAccountTransactionsUseCase } from './get-account-transactions.ts'
import { InMemoryTransactionsRepository } from 'tests/repositories/in-memory-transactions-repository.ts'
import { ITransactionsRepository } from '../repositories/transactions-repository.ts'
import { makeTransaction } from 'tests/factories/make-transaction.ts'
import { Transaction, TransactionOperation } from '@/domain/enterprise/entites/transaction.ts'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository

let sut: GetAccountTransactionsUseCase

describe('Get account transactions category use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()

    sut = new GetAccountTransactionsUseCase(
      membersRepository,
      accountsRepository,
      transactionsRepository
    )
  })

  it('should be able to get account transactions', async () => {
    const member = await makeMember()
    await membersRepository.create(member)
    
    const account = await makeAccount({
        holderId: member.id
    })
    await accountsRepository.create(account)

    const transaction = await makeTransaction({
        accountId: account.id,
        amount: 50,
        operation: TransactionOperation.INCOME
    })
    await transactionsRepository.create(transaction)

    const result = await sut.execute({
        memberId: member.id.toString()
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.transactions).toHaveLength(1)
      expect(result.value.transactions[0].amount).toBe(50)
      expect(result.value.transactions[0].isIncome()).toBe(true)
    }
  })
})
