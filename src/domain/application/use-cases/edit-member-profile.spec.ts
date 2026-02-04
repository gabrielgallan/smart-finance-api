import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { Hash } from '@/domain/enterprise/entites/value-objects/hash.ts'
import { makeMember } from 'tests/factories/make-member.ts'
import { EditMemberProfileUseCase } from './edit-member-profile.ts'

let membersRepository: IMembersRepository
let sut: EditMemberProfileUseCase

describe('Edit member profile use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    sut = new EditMemberProfileUseCase(membersRepository)
  })

  it('should be able to authenticate a member', async () => {
    const member = await makeMember({
      email: 'johndoe@email.com',
      password: await Hash.create('johnDoe123'),
    })

    await membersRepository.create(member)

    const result = await sut.execute({
      memberId: member.id.toString(),
      email: 'newjohn@email.com',
      password: 'newJohnPass',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.member.email).toBe('newjohn@email.com')

      const passCorrect =
        await result.value.member.password.compare('newJohnPass')
      expect(passCorrect).toBe(true)
    }
  })
})
