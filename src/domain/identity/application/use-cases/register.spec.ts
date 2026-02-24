import { RegisterUseCase } from './register'
import { Hasher } from '../cryptography/hasher'
import { HasherStup } from 'test/unit/cryptography/hasher'
import { InMemoryUsersRepository } from 'test/unit/repositories/in-memory-users-repository'
import { User } from '../../enterprise/entities/user'
import { makeUser } from 'test/unit/factories/make-user'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'

let usersRepository: InMemoryUsersRepository
let hasher: Hasher

let sut: RegisterUseCase

describe('Register new member use case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    hasher = new HasherStup()

    sut = new RegisterUseCase(
      usersRepository,
      hasher
    )
  })

  it('should be able to register a new member', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: 'JohnDoe123',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.user).toBeInstanceOf(User)
      expect(result.value.user.id.toString()).toBeTypeOf('string')
      expect(result.value.user.email).toBe('johndoe@email.com')
    }
  })

  it('should not be able to register a new user with existing email', async () => {
    await usersRepository.create(
      await makeUser({
        email: 'johndoe@email.com',
      })
    )

    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: 'JohnDoe123'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })
})
