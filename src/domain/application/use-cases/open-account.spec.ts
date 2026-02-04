import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { ResourceNotFoundError } from './errors/resource-not-found-error.ts'
import { OpenAccountUseCase } from './open-account.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { InMemoryAccountsRepository } from 'tests/repositories/in-memory-accounts-repository.ts'
import { Account } from '@/domain/enterprise/entites/account.ts'
import { MemberAlreadyHasAccountError } from './errors/member-alredy-has-account-error.ts'
import { makeMember } from 'tests/factories/make-member.ts'

let membersRepository: IMembersRepository
let accountRepository: IAccountsRepository
let sut: OpenAccountUseCase

describe('Open member account use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountRepository = new InMemoryAccountsRepository()

    sut = new OpenAccountUseCase(membersRepository, accountRepository)
  })

  it('should be able to open a member account', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const result = await sut.execute({
      memberId: member.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.account).toBeInstanceOf(Account)
      expect(result.value.account.balance).toBe(0)
      expect(result.value.account.holderId.toString()).toBe(
        member.id.toString(),
      )
    }
  })

  it('should be able to open a member account with initial balance', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    const result = await sut.execute({
      memberId: member.id.toString(),
      initialBalance: 250,
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.account).toBeInstanceOf(Account)
      expect(result.value.account.balance).toBe(250)
      expect(result.value.account.holderId.toString()).toBe(
        member.id.toString(),
      )
    }
  })

  it('should not be able to open a account of a member that does not exist', async () => {
    const result = await sut.execute({
      memberId: 'non-existing-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to open account of a member already has account', async () => {
    const member = await makeMember()
    await membersRepository.create(member)

    await sut.execute({
      memberId: member.id.toString(),
    })

    const result = await sut.execute({
      memberId: member.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(MemberAlreadyHasAccountError)
  })
})
