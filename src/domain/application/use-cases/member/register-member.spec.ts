import { it, describe, expect, beforeEach, afterEach, vi } from 'vitest'
import { RegisterMemberUseCase } from './register-member.ts'
import { Member } from '../../../enterprise/entites/member.ts'
import { IMembersRepository } from '../../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository'
import { InvalidMemberAgeError } from '../errors/invalid-member-age-erros.ts'
import { MemberAlreadyExistsError } from '../errors/member-already-exists-error.ts'

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

        const { member } = await sut.execute({
            name: 'John Doe',
            birthDate: new Date(2005, 9, 31, 20, 0, 0),
            document: '0123456789',
            email: 'johndoe@email.com',
            password: 'JohnDoe123',
        })

        expect(member).toBeInstanceOf(Member)
        expect(member.id.toString()).toBeTypeOf('string')
        expect(member.email).toBe('johndoe@email.com')
    })

    it('should not be able to register a new member under 16 years old', async () => {
        vi.setSystemTime(new Date(2015, 9, 31, 20, 0, 0))

        await expect(() =>
            sut.execute({
                name: 'John Doe',
                birthDate: new Date(2005, 9, 31, 20, 0, 0),
                document: '0123456789',
                email: 'johndoe@email.com',
                password: 'JohnDoe123',
            })
        ).rejects.toBeInstanceOf(InvalidMemberAgeError)
    })

    it('should not be able to register a new member with existing email', async () => {
        vi.setSystemTime(new Date(2026, 0, 31, 20, 0, 0))

        const { member } = await sut.execute({
            name: 'John Doe',
            birthDate: new Date(2005, 9, 31, 20, 0, 0),
            document: '0123456789',
            email: 'johndoe@email.com',
            password: 'JohnDoe123',
        })

        await expect(() =>
            sut.execute({
                name: 'John Doe',
                birthDate: new Date(2005, 9, 31, 20, 0, 0),
                document: '0000000001',
                email: 'johndoe@email.com',
                password: 'JohnDoe123',
            })
        ).rejects.toBeInstanceOf(MemberAlreadyExistsError)
    })

    it('should not be able to register a new member with existing document', async () => {
        vi.setSystemTime(new Date(2026, 0, 31, 20, 0, 0))

        const { member } = await sut.execute({
            name: 'John Doe',
            birthDate: new Date(2005, 9, 31, 20, 0, 0),
            document: '0123456789',
            email: 'johndoe@email.com',
            password: 'JohnDoe123',
        })

        await expect(() =>
            sut.execute({
                name: 'John Doe',
                birthDate: new Date(2005, 9, 31, 20, 0, 0),
                document: '0123456789',
                email: 'johndoe2@email.com',
                password: 'JohnDoe123',
            })
        ).rejects.toBeInstanceOf(MemberAlreadyExistsError)
    })
})