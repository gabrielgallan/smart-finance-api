import { it, describe, expect, beforeEach } from 'vitest'
import { Member } from '../../../enterprise/entites/member.ts'
import { IMembersRepository } from '../../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { AuthenticateMemberUseCase } from './authenticate-member.ts'
import { Hash } from '@/domain/enterprise/entites/value-objects/hash.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error.ts'

let membersRepository: IMembersRepository
let sut: AuthenticateMemberUseCase

describe('Authenticate member use case', () => {
    beforeEach(() => {
        membersRepository = new InMemoryMembersRepository()
        sut = new AuthenticateMemberUseCase(membersRepository)
    })

    it('should be able to authenticate a member', async () => {
        const member = Member.create({
            name: 'John Doe',
            age: 20,
            document: '0123456789',
            email: 'johndoe@email.com',
            password: await Hash.crate('johnDoe123'),
        })

        await membersRepository.create(member)

        const { memberId } = await sut.execute({
            email: 'johndoe@email.com',
            password: 'johnDoe123'
        })

        expect(memberId).toBeInstanceOf(UniqueEntityID)
        expect(memberId.toString()).toBeTypeOf('string')
    })

    it('should not be able to authenticate a member that does not exist', async () => {
        await expect(() =>
            sut.execute({
                email: 'johndoe@email.com',
                password: 'johnDoe123'
            })
        ).rejects.toBeInstanceOf(ResourceNotFoundError)
    })

    it('should not be able to authenticate a member with incorrect credentials', async () => {
        const member = Member.create({
            name: 'John Doe',
            age: 20,
            document: '0123456789',
            email: 'johndoe@email.com',
            password: await Hash.crate('johnDoe123'),
        })

        await membersRepository.create(member)

        await expect(() =>
            sut.execute({
                email: 'johndoe@email.com',
                password: 'incorrectPassword'
            })
        ).rejects.toBeInstanceOf(InvalidCredentialsError)
    })
})