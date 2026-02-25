import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/users-repository'
import { TokensRepository } from '../repositories/tokens-repository'
import { TokenType } from '@/domain/identity/enterprise/entities/token'
import { Token } from '../../enterprise/entities/token'
import { EmailSender } from '../email/email-sender'

interface RequestPasswordRecoverUseCaseRequest {
    email: string
}

type RequestPasswordRecoverUseCaseResponse = Either<
    ResourceNotFoundError,
    null
>

@Injectable()
export class RequestPasswordRecoverUseCase {
    constructor(
        private usersRepository: UsersRepository,
        private tokensRepository: TokensRepository,
        private emailSender: EmailSender
    ) { }

    async execute({
        email
    }: RequestPasswordRecoverUseCaseRequest): Promise<RequestPasswordRecoverUseCaseResponse> {
        const user = await this.usersRepository.findByEmail(email)

        if (!user) {
            return left(new ResourceNotFoundError())
        }

        const token = Token.create({
            userId: user.id,
            type: TokenType.PASSWORD_RECOVER
        })

        await this.tokensRepository.create(token)

        await this.emailSender.send({
            to: user.email,
            subject: 'Password recovery',
            text: `Use this token to recover your password: ${token.id.toString()}`
        })

        return right(null)
    }
}
