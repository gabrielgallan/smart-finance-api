import { BadGatewayException, BadRequestException, Injectable } from "@nestjs/common";
import { z } from "zod";
import { EnvService } from "../env/env.service";
import ky, { HTTPError } from "ky";

interface GithubOAuthServiceInput {
    OAuthCode: string
}

@Injectable()
export class GithubOAuthService {
    constructor(
        private env: EnvService
    ) { }

    async getGithubUser({ OAuthCode: code }: GithubOAuthServiceInput) {
        const githubOAuthURL = new URL('https://github.com/login/oauth/access_token')

        try {
            const githubOAuthTokenResponse = await ky.post(githubOAuthURL, {
                searchParams: {
                    client_id: this.env.get('GITHUB_OAUTH_CLIENT_ID'),
                    client_secret: this.env.get('GITHUB_OAUTH_CLIENT_SECRET'),
                    redirect_uri: this.env.get('GITHUB_OAUTH_CLIENT_REDIRECT_URI'),
                    code
                }
            }).json()

            const OAuthResult = z.object({
                access_token: z.string(),
                token_type: z.literal('bearer'),
                scope: z.string()
            }).safeParse(githubOAuthTokenResponse)

            if (!OAuthResult.success) {
                throw new BadGatewayException({
                    message: 'Wrong data format returned from GitHub OAuth API'
                })
            }

            const githubUserResponse = await ky.get('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${OAuthResult.data.access_token}`
                }
            }).json()

            const githubUserResult = z.object({
                id: z.number().int().transform(String),
                email: z.string().nullable(),
                name: z.string().nullable(),
                avatar_url: z.string().url()
            }).safeParse(githubUserResponse)

            if (!githubUserResult.success) {
                throw new BadGatewayException({
                    message: 'Wrong user data returned from GitHub API'
                })
            }

            const {
                email,
                name,
                id: githubId,
                avatar_url: avatarUrl
            } = githubUserResult.data

            if (!email) {
                throw new BadRequestException({
                    message: 'Provide a e-mail in your github account to authenticate!'
                })
            }

            return {
                githubId,
                email,
                name,
                avatarUrl
            }
        } catch (err) {
            if (err instanceof HTTPError) {
                throw new BadGatewayException({
                    message: 'Failed connect with GitHug OAuth API'
                })
            }

            throw err
        }
    }
}