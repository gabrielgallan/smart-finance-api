import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { GithubOAuthService } from '@/infra/auth/github-oauth.service'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Encrypter } from '@/domain/identity/application/cryptography/encrypter'
import { Public } from '@/infra/auth/public'

const bodySchema = z.object({
    code: z.string()
})

type BodyDTO = z.infer<typeof bodySchema>

@Controller('/api')
@Public()
export class AuthenticateWithGithubController {
    constructor(
        private githubOAuthService: GithubOAuthService,
        private prisma: PrismaService,
        private encrypter: Encrypter
    ) { }

    @Post('/sessions/github')
    @HttpCode(201)
    async handle(
        @Body(new ZodValidationPipe(bodySchema)) body: BodyDTO
    ) {
        const { code } = body

        const githubUser = await this.githubOAuthService.getGithubUser({
            OAuthCode: code
        })

        let member = await this.prisma.member.findUnique({
            where: {
                email: githubUser.email
            }
        })

        if (!member) {
            member = await this.prisma.member.create({
                data: {
                    name: githubUser.name,
                    email: githubUser.email
                }
            })
        }

        const externalAccount = await this.prisma.externalAccount.findUnique({
            where: {
                provider_memberId: {
                    provider: 'GITHUB',
                    memberId: member.id
                }
            }
        })

        if (!externalAccount) {
            await this.prisma.externalAccount.create({
                data: {
                    provider: 'GITHUB',
                    providerAccountId: githubUser.githubId,
                    member: {
                        connect: { id: member.id }
                    }
                }
            })
        }

        const token = await this.encrypter.encrypt({ sub: member.id })

        return {
            token
        }
    }
}
