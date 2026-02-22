import { IMembersRepository } from '../repositories/members-repository'
import { InMemoryMembersRepository } from 'test/unit/repositories/in-memory-members-repository'
import { makeMember } from 'test/unit/factories/make-member'
import { EditMemberProfileUseCase } from './edit-member-profile'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { BcriptjsHasher } from 'test/unit/criptography/hasher'
import { Hasher } from '../criptography/hasher'

let membersRepository: IMembersRepository
let hasher: Hasher

let sut: EditMemberProfileUseCase

describe('Edit member profile use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    hasher = new BcriptjsHasher()

    sut = new EditMemberProfileUseCase(
      membersRepository,
      hasher
    )
  })

  it('should be able to edit a member profile', async () => {
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
      memberId: 'member-1',
      email: 'newjohn@email.com',
      password: 'newJohnPass',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(membersRepository.items[0].email).toBe('newjohn@email.com')

      const passCorrect = await hasher.compare(
        'newJohnPass',
        membersRepository.items[0].password
      )
      
      expect(passCorrect).toBe(true)
    }
  })
})
