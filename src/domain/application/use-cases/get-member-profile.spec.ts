import { Member } from '../../enterprise/entites/member.ts'
import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { Hash } from '@/domain/enterprise/entites/value-objects/hash.ts'
import { ResourceNotFoundError } from './errors/resource-not-found-error.ts'
import { GetMemberProfileUseCase } from './get-member-profile.ts'
import { makeMember } from 'tests/factories/make-member.ts'

let membersRepository: IMembersRepository
let sut: GetMemberProfileUseCase

describe('Get member profile use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    sut = new GetMemberProfileUseCase(membersRepository)
  })

  it('should be able to get a member profile', async () => {
    const member = await makeMember({
      email: 'johndoe@email.com'
    })
    await membersRepository.create(member)

    const result = await sut.execute({
      memberId: member.id.toString(),
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
