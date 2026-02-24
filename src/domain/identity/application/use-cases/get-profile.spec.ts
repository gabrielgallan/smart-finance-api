import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { GetProfileUseCase } from './get-profile'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryUsersRepository } from 'test/unit/repositories/in-memory-users-repository'
import { makeUser } from 'test/unit/factories/make-user'

let usersRepository: InMemoryUsersRepository
let sut: GetProfileUseCase

describe('Get profile use case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new GetProfileUseCase(usersRepository)
  })

  it('should be able to get profile', async () => {
    await usersRepository.create(
      await makeUser(
        {
          email: 'johndoe@email.com',
        },
        new UniqueEntityID('user-1'),
      ),
    )

    const result = await sut.execute({
      userId: 'user-1',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value.user.email).toBe('johndoe@email.com')
  })

  it('should not be able to get a profile that a user does not exist', async () => {
    const result = await sut.execute({
      userId: 'non-exists-user-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
