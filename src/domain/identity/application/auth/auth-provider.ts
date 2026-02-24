export interface ExternalUserProps {
    id?: string
    name?: string
    avatarUrl?: string
    email: string
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