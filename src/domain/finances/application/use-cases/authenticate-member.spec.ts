import { IMembersRepository } from '../repositories/members-repository'
import { InMemoryMembersRepository } from 'test/repositories/in-memory-members-repository'
import { AuthenticateMemberUseCase } from './authenticate-member'
import { Hash } from '@/domain/finances/enterprise/entites/value-objects/hash'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { makeMember } from 'test/factories/make-member'

let membersRepository: IMembersRepository
let sut: AuthenticateMemberUseCase

describe('Authenticate member use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    sut = new AuthenticateMemberUseCase(membersRepository)
  })

  it('should be able to authenticate a member', async () => {
    await membersRepository.create(
      await makeMember(
        {
          email: 'johndoe@email.com',
          password: await Hash.create('johnDoe123'),
        },
        new UniqueEntityID('member-1'),
      ),
    )

    const result = await sut.execute({
      email: 'johndoe@email.com',
      password: 'johnDoe123',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.memberId).toBeInstanceOf(UniqueEntityID)
      expect(result.value.memberId.toString()).toBe('member-1')
    }
  })

  it('should not be able to authenticate a member that does not exist', async () => {
    const result = await sut.execute({
      email: 'johndoe@email.com',
      password: 'johnDoe123',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to authenticate a member with incorrect credentials', async () => {
    await membersRepository.create(
      await makeMember({
        email: 'johndoe@email.com',
        password: await Hash.create('johnDoe123'),
      }),
    )

    const result = await sut.execute({
      email: 'johndoe@email.com',
      password: 'incorrectPassword',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })
})
