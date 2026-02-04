import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { makeMember } from 'tests/factories/make-member.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { makeAccount } from 'tests/factories/make-account.ts'
import { InMemoryAccountsRepository } from 'tests/repositories/in-memory-accounts-repository.ts'
import { GetAccountTransactionsUseCase } from './get-account-transactions.ts'
import { InMemoryTransactionsRepository } from 'tests/repositories/in-memory-transactions-repository.ts'
import { ITransactionsRepository } from '../repositories/transactions-repository.ts'
import { makeTransaction } from 'tests/factories/make-transaction.ts'
import { TransactionOperation } from '@/domain/enterprise/entites/transaction.ts'

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
      transactionsRepository,
    )
  })

  it('should be able to get account transactions', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const account = await makeAccount({
      holderId: member.id,
    })
    await accountsRepository.create(account)

    const transaction = await makeTransaction({
      accountId: account.id,
      amount: 50,
      operation: TransactionOperation.INCOME,
    })
    await transactionsRepository.create(transaction)

    const result = await sut.execute({
      memberId: member.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.transactions).toHaveLength(1)
      expect(result.value.transactions[0].amount).toBe(50)
      expect(result.value.transactions[0].isIncome()).toBe(true)
    }
  })
})
