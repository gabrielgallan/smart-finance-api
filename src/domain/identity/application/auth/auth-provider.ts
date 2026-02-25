export interface ExternalUserProps {
    id: string | null
    name: string | null
    email: string
    avatarUrl: string | null
}

export interface DefaultSignInData {
    code: string
}

export abstract class ExternalAuthProvider<
    TUser extends ExternalUserProps = ExternalUserProps,
    TSignInData = DefaultSignInData
> {
    abstract signIn(data: TSignInData): Promise<TUser>;
}