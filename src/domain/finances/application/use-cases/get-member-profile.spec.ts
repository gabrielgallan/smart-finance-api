import { IMembersRepository } from '../repositories/members-repository'
import { InMemoryMembersRepository } from 'test/unit/repositories/in-memory-members-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { GetMemberProfileUseCase } from './get-member-profile'
import { makeMember } from 'test/unit/factories/make-member'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let membersRepository: IMembersRepository
let sut: GetMemberProfileUseCase

describe('Get member profile use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    sut = new GetMemberProfileUseCase(membersRepository)
  })

  it('should be able to get a member profile', async () => {
    await membersRepository.create(
      await makeMember(
        {
          email: 'johndoe@email.com',
        },
        new UniqueEntityID('member-1'),
      ),
    )

    const result = await sut.execute({
      memberId: 'member-1',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value.member.email).toBe('johndoe@email.com')
  })

  it('should not be able to get a profile that a member does not exist', async () => {
    const result = await sut.execute({
      memberId: 'non-exists-member-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
