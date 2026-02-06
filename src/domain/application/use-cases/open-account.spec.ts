import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { ResourceNotFoundError } from './errors/resource-not-found-error.ts'
import { OpenAccountUseCase } from './open-account.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { InMemoryAccountsRepository } from 'tests/repositories/in-memory-accounts-repository.ts'
import { MemberAlreadyHasAccountError } from './errors/member-alredy-has-account-error.ts'
import { makeMember } from 'tests/factories/make-member.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'

let membersRepository: IMembersRepository
let accountRepository: IAccountsRepository
let sut: OpenAccountUseCase

describe('Open member account use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    accountRepository = new InMemoryAccountsRepository()

    sut = new OpenAccountUseCase(membersRepository, accountRepository)
  })

  it('should be able to open a member account with initial balance', async () => {
    await membersRepository.create(
      await makeMember({}, new UniqueEntityID('member-1')),
    )

    const result = await sut.execute({
      memberId: 'member-1',
      initialBalance: 250,
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.account.balance).toBe(250)
      expect(result.value.account.holderId.toString()).toBe('member-1')
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
    await membersRepository.create(
      await makeMember({}, new UniqueEntityID('member-1')),
    )

    await sut.execute({
      memberId: 'member-1',
    })

    const result = await sut.execute({
      memberId: 'member-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(MemberAlreadyHasAccountError)
  })
})
