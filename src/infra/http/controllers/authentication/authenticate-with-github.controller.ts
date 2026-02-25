import { Body, Controller, HttpCode, InternalServerErrorException, Post } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { Public } from '@/infra/auth/public'
import { AuthenticateWithExternalProviderUseCase } from '@/domain/identity/application/use-cases/authenticate-with-external-provider'
import { ExternalAccountProvider } from '@prisma/client'

const bodySchema = z.object({
    code: z.string()
})

type BodyDTO = z.infer<typeof bodySchema>

@Controller('/api')
@Public()
export class AuthenticateWithGithubController {
    constructor(
        private authenticateWithGitHub: AuthenticateWithExternalProviderUseCase
    ) { }

    @Post('/sessions/github')
    @HttpCode(201)
    async handle(
        @Body(new ZodValidationPipe(bodySchema)) body: BodyDTO
    ) {
        const { code } = body

        const result = await this.authenticateWithGitHub.execute({
            provider: ExternalAccountProvider.GITHUB,
            code
        })

        if (result.isLeft()) {
            throw new InternalServerErrorException()
        }

        return {
            token: result.value.token
        }
    }
}
