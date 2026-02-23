import { InMemoryMembersRepository } from 'test/unit/repositories/in-memory-members-repository'
import { makeMember } from 'test/unit/factories/make-member'
import { ResetMemberPasswordUseCase } from './reset-member-password'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { HasherStup } from 'test/unit/cryptography/hasher'
import { Hasher } from '../cryptography/hasher'

let membersRepository: InMemoryMembersRepository
let hasher: Hasher

let sut: ResetMemberPasswordUseCase

describe('Reset member password use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    hasher = new HasherStup()

    sut = new ResetMemberPasswordUseCase(
      membersRepository,
      hasher
    )
  })

  it('should be able to reset a member password', async () => {
    await membersRepository.create(
      await makeMember(
        {
          password: await hasher.generate('johnDoe123'),
        },
        new UniqueEntityID('member-1'),
      ),
    )

    const result = await sut.execute({
      memberId: 'member-1',
      password: 'newJohnPass',
    })

    expect(result.isRight()).toBe(true)

    const passCorrect = await hasher.compare(
      'newJohnPass',
      membersRepository.items[0].password!
    )

    expect(passCorrect).toBe(true)
  })
})
