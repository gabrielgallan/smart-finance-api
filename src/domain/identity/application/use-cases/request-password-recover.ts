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
            text: `You requested to reset your password.

Use the following token to reset it:

${token.id.toString()}

If you didn't request this, you can safely ignore this email.`,
            html: `
<div style="font-family: Arial, Helvetica, sans-serif; background:#f4f4f5; padding:40px 20px;">
  <div style="max-width:500px; margin:0 auto; background:white; padding:32px; border-radius:8px; border:1px solid #e4e4e7;">
    
    <h2 style="margin-top:0; color:#18181b;">Password Reset</h2>
    
    <p style="color:#3f3f46; line-height:1.5;">
      We received a request to reset your password.
    </p>

    <p style="color:#3f3f46; line-height:1.5;">
      Use the token below to reset your password:
    </p>

    <div style="
      margin:24px 0;
      padding:16px;
      text-align:center;
      font-size:20px;
      letter-spacing:2px;
      font-weight:bold;
      background:#f4f4f5;
      border-radius:6px;
      border:1px dashed #d4d4d8;
      color:#18181b;
    ">
      ${token.id.toString()}
    </div>

    <p style="color:#52525b; font-size:14px; line-height:1.5;">
      If you didn't request a password reset, you can safely ignore this email.
    </p>

    <p style="color:#a1a1aa; font-size:12px; margin-top:24px;">
      This is an automated message. Please do not reply.
    </p>

  </div>
</div>
`
        })

        return right(null)
    }
}
