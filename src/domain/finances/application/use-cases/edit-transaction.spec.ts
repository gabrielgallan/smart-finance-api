import { IAccountsRepository } from '../repositories/accounts-repository'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { InMemoryAccountsRepository } from 'test/unit/repositories/in-memory-accounts-repository'
import { InMemoryTransactionsRepository } from 'test/unit/repositories/in-memory-transactions-repository'
import { makeAccount } from 'test/unit/factories/make-account'
import { InMemoryCategoriesRepository } from 'test/unit/repositories/in-memory-category-repository'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { makeCategory } from 'test/unit/factories/make-category'
import { EditTransactionUseCase } from './edit-transaction'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeTransaction } from 'test/unit/factories/make-transaction'

let accountsRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository
let categoriesRepository: ICategoriesRepository

let sut: EditTransactionUseCase

describe('Edit transaction use case', () => {
  beforeEach(() => {
    accountsRepository = new InMemoryAccountsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new EditTransactionUseCase(
      accountsRepository,
      transactionsRepository,
      categoriesRepository,
    )
  })

  it('should be able to edit a transaction', async () => {
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
          name: 'Monthly Bills',
        },
        new UniqueEntityID('category-2'),
      ),
    )

    await transactionsRepository.create(
      makeTransaction(
        {
          accountId: new UniqueEntityID('account-1'),
          title: 'Netflix',
          amount: 39.99,
        },
        new UniqueEntityID('transaction-1'),
      ),
    )

    expect(transactionsRepository.items[0].title).toBe('Netflix')

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
      expect(result.value.transaction.method).toBe('credit')
      expect(result.value.transaction.categoryId?.toString()).toBe('category-2')
    }
  })
})
