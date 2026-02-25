import { Either, right } from '@/core/types/either'
import { Injectable } from '@nestjs/common'
import { Encrypter } from '../cryptography/encrypter'
import { UsersRepository } from '../repositories/users-repository'
import { ExternalAccountRepository } from '../repositories/external-account-repository'
import { ExternalAuthProvider } from '../auth/auth-provider'
import { User } from '../../enterprise/entities/user'
import { ExternalAccount } from '../../enterprise/entities/external-account'

interface AuthenticateWithExternalProviderUseCaseRequest {
    provider: string
    code: string
}

type AuthenticateWithExternalProviderUseCaseResponse = Either<
    null,
    { token: string }
>

@Injectable()
export class AuthenticateWithExternalProviderUseCase {
    constructor(
        private usersRepository: UsersRepository,
        private externalAccountRepository: ExternalAccountRepository,
        private authProvider: ExternalAuthProvider,
        private encrypter: Encrypter,
    ) { }

    async execute({
        provider,
        code
    }: AuthenticateWithExternalProviderUseCaseRequest): Promise<AuthenticateWithExternalProviderUseCaseResponse> {
        const { id, email, name, avatarUrl } = await this.authProvider.signIn({ code })

        let user = await this.usersRepository.findByEmail(email)

        if (!user) {
            user = User.create({
                name,
                email,
                avatarUrl
            })

            await this.usersRepository.create(user)
        }

        const account = await this.externalAccountRepository.findByProviderAndUserId(
            provider,
            user.id.toString()
        )

        if (!account) {
            const externalAccount = ExternalAccount.create({
                userId: user.id,
                provider,
                providerUserId: id
            })

            await this.externalAccountRepository.create(externalAccount)
        }

        const token = await this.encrypter.encrypt({ sub: user.id.toString() })

        return right({
            token
        })
    }
}
