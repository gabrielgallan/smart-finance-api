import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryUsersRepository } from 'test/unit/repositories/in-memory-users-repository'
import { makeUser } from 'test/unit/factories/make-user'
import { RequestPasswordRecoverUseCase } from './request-password-recover'
import { InMemoryTokensRepository } from 'test/unit/repositories/in-memory-tokens-repository'
import { EmailSenderMock } from 'test/unit/email/email-sender'

let usersRepository: InMemoryUsersRepository
let tokensRepository: InMemoryTokensRepository
let emailSender: EmailSenderMock

let sut: RequestPasswordRecoverUseCase

describe('Request password recover use case', () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        tokensRepository = new InMemoryTokensRepository()
        emailSender = new EmailSenderMock()

        sut = new RequestPasswordRecoverUseCase(
            usersRepository,
            tokensRepository,
            emailSender
        )
    })

    it('should be able to request password recover', async () => {
        await usersRepository.create(
            await makeUser(
                {
                    email: 'johndoe@email.com',
                },
                new UniqueEntityID('user-1'),
            ),
        )

        const result = await sut.execute({
            email: 'johndoe@email.com',
        })

        expect(result.isRight()).toBe(true)
        expect(emailSender.emails[0].to).toBe('johndoe@email.com')
        expect(tokensRepository.items[0].userId.toString()).toBe('user-1')
    })
})
