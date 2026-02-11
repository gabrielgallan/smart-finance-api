import { RegisterMemberUseCase } from './register-member'
import { Member } from '../../enterprise/entites/member'
import { IMembersRepository } from '../repositories/members-repository'
import { InMemoryMembersRepository } from 'test/repositories/in-memory-members-repository'
import { InvalidMemberAgeError } from './errors/invalid-member-age-erros'
import { MemberAlreadyExistsError } from './errors/member-already-exists-error'
import { makeMember } from 'test/factories/make-member'

let membersRepository: IMembersRepository
let sut: RegisterMemberUseCase

describe('Register new member use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    sut = new RegisterMemberUseCase(membersRepository)

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to register a new member', async () => {
    vi.setSystemTime(new Date(2026, 0, 31, 20, 0, 0))

    const result = await sut.execute({
      name: 'John Doe',
      birthDate: new Date(2005, 9, 31, 20, 0, 0),
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

  it('should not be able to register a new member under 16 years old', async () => {
    vi.setSystemTime(new Date(2015, 9, 31, 20, 0, 0))

    const result = await sut.execute({
      name: 'John Doe',
      birthDate: new Date(2005, 9, 31, 20, 0, 0),
      document: '0123456789',
      email: 'johndoe@email.com',
      password: 'JohnDoe123',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidMemberAgeError)
  })

  it('should not be able to register a new member with existing email', async () => {
    vi.setSystemTime(new Date(2026, 0, 31, 20, 0, 0))

    const member = await makeMember({
      email: 'johndoe@email.com',
    })

    await membersRepository.create(member)

    const result = await sut.execute({
      name: 'John Doe',
      birthDate: new Date(2005, 9, 31, 20, 0, 0),
      document: '0000000001',
      email: 'johndoe@email.com',
      password: 'JohnDoe123',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(MemberAlreadyExistsError)
  })

  it('should not be able to register a new member with existing document', async () => {
    vi.setSystemTime(new Date(2026, 0, 31, 20, 0, 0))

    const member = await makeMember({
      document: '0123456789',
    })

    await membersRepository.create(member)

    const result = await sut.execute({
      name: 'John Doe',
      birthDate: new Date(2005, 9, 31, 20, 0, 0),
      document: '0123456789',
      email: 'johndoe2@email.com',
      password: 'JohnDoe123',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(MemberAlreadyExistsError)
  })
})
