import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from 'test/repositories/in-memory-members-repository.ts'
import { Hash } from '@/domain/finances/enterprise/entites/value-objects/hash.ts'
import { makeMember } from 'test/factories/make-member.ts'
import { EditMemberProfileUseCase } from './edit-member-profile.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'

let membersRepository: IMembersRepository
let sut: EditMemberProfileUseCase

describe('Edit member profile use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    sut = new EditMemberProfileUseCase(membersRepository)
  })

  it('should be able to edit a member profile', async () => {
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
      memberId: 'member-1',
      email: 'newjohn@email.com',
      password: 'newJohnPass',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(membersRepository.items[0].email).toBe('newjohn@email.com')

      const passCorrect =
        await membersRepository.items[0].password.compare('newJohnPass')
      expect(passCorrect).toBe(true)
    }
  })
})
