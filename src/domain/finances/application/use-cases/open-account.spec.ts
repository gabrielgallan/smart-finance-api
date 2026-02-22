import { IMembersRepository } from '../repositories/members-repository'
import { InMemoryMembersRepository } from 'test/repositories/in-memory-members-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { OpenAccountUseCase } from './open-account'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository'
import { MemberAlreadyHasAccountError } from './errors/member-alredy-has-account-error'
import { makeMember } from 'test/factories/make-member'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

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
