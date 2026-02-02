import { it, describe, expect, beforeEach } from 'vitest'
import { Member } from '../../../enterprise/entites/member.ts'
import { IMembersRepository } from '../../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { Hash } from '@/domain/enterprise/entites/value-objects/hash.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { GetMemberProfileUseCase } from './get-member-profile.ts'

let membersRepository: IMembersRepository
let sut: GetMemberProfileUseCase

describe('Get member profile use case', () => {
    beforeEach(() => {
        membersRepository = new InMemoryMembersRepository()
        sut = new GetMemberProfileUseCase(membersRepository)
    })

    it('should be able to get a member profile', async () => {
        const memberCreated = Member.create({
            name: 'John Doe',
            age: 20,
            document: '0123456789',
            email: 'johndoe@email.com',
            password: await Hash.crate('johnDoe123'),
        })

        await membersRepository.create(memberCreated)

        const { member } = await sut.execute({
            memberId: memberCreated.id.toString()
        })

        expect(member).toBeInstanceOf(Member)
        expect(member.email).toBe('johndoe@email.com')
    })

    it('should not be able to get a profile that a member does not exist', async () => {
        await expect(() =>
            sut.execute({
                memberId: 'non-exists-member-id'
            })
        ).rejects.toBeInstanceOf(ResourceNotFoundError)
    })
})