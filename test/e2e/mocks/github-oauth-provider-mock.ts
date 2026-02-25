import { ExternalAuthProvider, ExternalUserProps } from "@/domain/identity/application/auth/auth-provider";
import { Injectable } from "@nestjs/common";

interface GithubOAuthProviderInputMock {
    OAuthCode: string
}

type GithubUserMock = ExternalUserProps

@Injectable()
export class GithubOAuthProviderMock implements ExternalAuthProvider<
    GithubUserMock,
    GithubOAuthProviderInputMock
> {
    async signIn({ OAuthCode }: GithubOAuthProviderInputMock) {
        return {
            id: `fake-id-user-${OAuthCode}`,
            name: 'John Doe',
            email: 'johndoe@email.com',
            avatarUrl: null
        }
    }
}