import { Body, Controller, InternalServerErrorException, Post } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { Public } from '@/infra/auth/public'
import { AuthenticateWithExternalProviderUseCase } from '@/domain/identity/application/use-cases/authenticate-with-external-provider'
import { ExternalAccountProvider } from '@prisma/client'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'

const bodySchema = z.object({
    code: z.string()
})

class AuthenticateWithGithubBodyDTO extends createZodDto(bodySchema) { }

@Controller('/api')
@Public()
@ApiTags('Authentication')
export class AuthenticateWithGithubController {
    constructor(
        private authenticateWithGitHub: AuthenticateWithExternalProviderUseCase
    ) { }

    @Post('/sessions/github')
    @ApiOperation({ summary: 'authenticate with github' })
    async handle(
        @Body(new ZodValidationPipe(bodySchema)) body: AuthenticateWithGithubBodyDTO
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
