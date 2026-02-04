import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { makeMember } from 'tests/factories/make-member.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { FetchAccountSummaryUseCase } from './fetch-account-summary.ts'
import { InMemoryAccountsRepository } from 'tests/repositories/in-memory-accounts-repository.ts'
import { makeAccount } from 'tests/factories/make-account.ts'

let membersRepository: IMembersRepository
let accountsRepository: IAccountsRepository

let sut: FetchAccountSummaryUseCase

describe('Fetch account summary use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountsRepository = new InMemoryAccountsRepository()

    sut = new FetchAccountSummaryUseCase(membersRepository, accountsRepository)
  })

  it('should be able to fetch account summary', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const account = await makeAccount({
      holderId: member.id,
      balance: 250,
    })
    await accountsRepository.create(account)

    const result = await sut.execute({
      memberId: member.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.balance).toBe(250)
      expect(result.value.lastUpdate).toBeInstanceOf(Date)
    }
  })
})
