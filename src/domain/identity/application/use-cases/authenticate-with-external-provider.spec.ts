import { Encrypter } from '../cryptography/encrypter'
import { EncrypterStub } from 'test/unit/cryptography/encrypter'
import { InMemoryUsersRepository } from 'test/unit/repositories/in-memory-users-repository'
import { AuthenticateWithExternalProviderUseCase } from './authenticate-with-external-provider'
import { InMemoryExternalAccountsRepository } from 'test/unit/repositories/in-memory-external-accounts-repository'
import { ExternalAuthProvider } from '../auth/auth-provider'
import { ExternalAuthProviderStub } from 'test/unit/auth/auth-provider'

let usersRepository: InMemoryUsersRepository
let externalAccountsRepository: InMemoryExternalAccountsRepository
let authProvider: ExternalAuthProvider
let encrypter: Encrypter

let sut: AuthenticateWithExternalProviderUseCase

describe('Authenticate with external provider use case', () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        externalAccountsRepository = new InMemoryExternalAccountsRepository()
        authProvider = new ExternalAuthProviderStub()
        encrypter = new EncrypterStub()

        sut = new AuthenticateWithExternalProviderUseCase(
            usersRepository,
            externalAccountsRepository,
            authProvider,
            encrypter
        )
    })

    it('should be able to authenticate with external provider', async () => {
        const result = await sut.execute({
            provider: 'fake-provider',
            code: 'fake-provider-code'
        })

        expect(result.isRight()).toBe(true)

        expect(externalAccountsRepository.items[0].providerUserId).toBe('external-user-id')

        expect(usersRepository.items[0].email).toBe('johndoe@example.com')
        expect(usersRepository.items[0].name).toBe('John Doe')
        expect(usersRepository.items[0].avatarUrl).toBe('https://example.com/avatar.jpg')
    })
})
