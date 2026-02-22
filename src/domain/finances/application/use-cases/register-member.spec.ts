import { RegisterMemberUseCase } from './register-member'
import { Member } from '../../enterprise/entities/member'
import { IMembersRepository } from '../repositories/members-repository'
import { InMemoryMembersRepository } from 'test/unit/repositories/in-memory-members-repository'
import { MemberAlreadyExistsError } from './errors/member-already-exists-error'
import { makeMember } from 'test/unit/factories/make-member'
import { Hasher } from '../cryptography/hasher'
import { HasherStup } from 'test/unit/cryptography/hasher'

let membersRepository: IMembersRepository
let hasher: Hasher

let sut: RegisterMemberUseCase

describe('Register new member use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    hasher = new HasherStup()
    
    sut = new RegisterMemberUseCase(
      membersRepository,
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
      expect(result.value.member).toBeInstanceOf(Member)
      expect(result.value.member.id.toValue()).toBeTypeOf('string')
      expect(result.value.member.email).toBe('johndoe@email.com')
    }
  })

  it('should not be able to register a new member with existing email', async () => {
    const member = await makeMember({
      email: 'johndoe@email.com',
    })

    await membersRepository.create(member)

    const result = await sut.execute({
      name: 'John Doe',
      document: '0000000001',
      email: 'johndoe@email.com',
      password: 'JohnDoe123',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(MemberAlreadyExistsError)
  })

  it('should not be able to register a new member with existing document', async () => {
    const member = await makeMember({
      document: '0123456789',
    })

    await membersRepository.create(member)

    const result = await sut.execute({
      name: 'John Doe',
      document: '0123456789',
      email: 'johndoe2@email.com',
      password: 'JohnDoe123',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(MemberAlreadyExistsError)
  })
})
