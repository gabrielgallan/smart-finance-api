import { ExternalAuthProvider, ExternalUserProps } from "@/domain/identity/application/auth/auth-provider";

interface Props extends ExternalUserProps {
    code: string;
}

interface SignInData {
    code: string
}

export class ExternalAuthProviderStub extends ExternalAuthProvider<Props, SignInData> {
    async signIn({ code }: SignInData) {
        return {
            id: 'external-user-id',
            email: 'johndoe@example.com',
            name: 'John Doe',
            avatarUrl: 'https://example.com/avatar.jpg',
            code
        }
    }
}