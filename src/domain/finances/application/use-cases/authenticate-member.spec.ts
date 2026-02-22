import { IMembersRepository } from '../repositories/members-repository'
import { InMemoryMembersRepository } from 'test/unit/repositories/in-memory-members-repository'
import { AuthenticateMemberUseCase } from './authenticate-member'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { makeMember } from 'test/unit/factories/make-member'
import { Hasher } from '../cryptography/hasher'
import { HasherStup } from 'test/unit/cryptography/hasher'
import { Encrypter } from '../cryptography/encrypter'
import { EncrypterStub } from 'test/unit/cryptography/encrypter'

let membersRepository: IMembersRepository
let hasher: Hasher
let encrypter: Encrypter

let sut: AuthenticateMemberUseCase

describe('Authenticate member use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    hasher = new HasherStup()
    encrypter = new EncrypterStub()

    sut = new AuthenticateMemberUseCase(
      membersRepository,
      hasher,
      encrypter
    )
  })

  it('should be able to authenticate a member', async () => {
    await membersRepository.create(
      await makeMember(
        {
          email: 'johndoe@email.com',
          password: await hasher.generate('johnDoe123'),
        },
        new UniqueEntityID('member-1'),
      ),
    )

    const result = await sut.execute({
      email: 'johndoe@email.com',
      password: 'johnDoe123',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value.token).toBe(JSON.stringify({ sub: 'member-1' }))
  })

  it('should not be able to authenticate a member with incorrect credentials', async () => {
    await membersRepository.create(
      await makeMember({
        email: 'johndoe@email.com',
        password: await hasher.generate('johnDoe123'),
      }),
    )

    const result = await sut.execute({
      email: 'johndoe@email.com',
      password: 'incorrectPassword',
    })

    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })
})
