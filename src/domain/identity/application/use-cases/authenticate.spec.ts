import { AuthenticateUseCase } from './authenticate'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { Hasher } from '../cryptography/hasher'
import { HasherStup } from 'test/unit/cryptography/hasher'
import { Encrypter } from '../cryptography/encrypter'
import { EncrypterStub } from 'test/unit/cryptography/encrypter'
import { InMemoryUsersRepository } from 'test/unit/repositories/in-memory-users-repository'
import { makeUser } from 'test/unit/factories/make-user'

let usersRepository: InMemoryUsersRepository
let hasher: Hasher
let encrypter: Encrypter

let sut: AuthenticateUseCase

describe('Authenticate member use case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    hasher = new HasherStup()
    encrypter = new EncrypterStub()

    sut = new AuthenticateUseCase(
      usersRepository,
      hasher,
      encrypter
    )
  })

  it('should be able to authenticate user with credentials', async () => {
    await usersRepository.create(
      await makeUser(
        {
          email: 'johndoe@email.com',
          passwordHash: await hasher.generate('johnDoe123'),
        },
        new UniqueEntityID('user-1'),
      ),
    )

    const result = await sut.execute({
      email: 'johndoe@email.com',
      password: 'johnDoe123',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value.token).toBe(JSON.stringify({ sub: 'user-1' }))
  })

  it('should not be able to authenticate a user with incorrect credentials', async () => {
    await usersRepository.create(
      await makeUser({
        email: 'johndoe@email.com',
        passwordHash: await hasher.generate('johnDoe123'),
      }),
    )

    const result = await sut.execute({
      email: 'johndoe@email.com',
      password: 'incorrectPassword',
    })

    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })
})
