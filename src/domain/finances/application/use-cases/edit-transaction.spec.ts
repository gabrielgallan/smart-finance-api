import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { makeMember } from 'tests/factories/make-member.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { ITransactionsRepository } from '../repositories/transactions-repository.ts'
import { InMemoryAccountsRepository } from 'tests/repositories/in-memory-accounts-repository.ts'
import { InMemoryTransactionsRepository } from 'tests/repositories/in-memory-transactions-repository.ts'
import { makeAccount } from 'tests/factories/make-account.ts'
import { InMemoryCategoriesRepository } from 'tests/repositories/in-memory-category-repository.ts'
import { ICategoriesRepository } from '../repositories/categories-repository.ts'
import { makeCategory } from 'tests/factories/make-category.ts'
import { EditTransactionUseCase } from './edit-transaction.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { makeTransaction } from 'tests/factories/make-transaction.ts'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository
let categoriesRepository: ICategoriesRepository

let sut: EditTransactionUseCase

describe('Edit transaction use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new EditTransactionUseCase(
      membersRepository,
      accountsRepository,
      transactionsRepository,
      categoriesRepository,
    )
  })

  it('should be able to edit a transaction', async () => {
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
      makeCategory(
        {
          accountId: new UniqueEntityID('account-1'),
          name: 'Movies',
        },
        new UniqueEntityID('category-1'),
      ),
    )

    await categoriesRepository.create(
      makeCategory(
        {
          accountId: new UniqueEntityID('account-1'),
          name: 'Monthly Bills',
        },
        new UniqueEntityID('category-2'),
      ),
    )

    await transactionsRepository.create(
      makeTransaction(
        {
          accountId: new UniqueEntityID('account-1'),
          categoryId: new UniqueEntityID('category-1'),
          title: 'Netflix',
          amount: 39.99,
        },
        new UniqueEntityID('transaction-1'),
      ),
    )

    expect(transactionsRepository.items[0].title).toBe('Netflix')
    expect(transactionsRepository.items[0].categoryId.toString()).toBe(
      'category-1',
    )

    const result = await sut.execute({
      memberId: 'member-1',
      transactionId: 'transaction-1',
      categoryId: 'category-2',
      title: 'Netflix Sign',
      method: 'credit',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.transaction.title).toBe('Netflix Sign')
      expect(result.value.transaction.categoryId?.toString()).toBe('category-2')
    }
  })
})
