import { User } from "@/domain/identity/enterprise/entities/user";

export interface UserPresenterToHTTP {
    name: string | null,
    email: string,
    avatarUrl: string | null
}

export class UserPresenter {
    static toHTTP(user: User): UserPresenterToHTTP {
        return {
            name: user.name ?? null,
            email: user.email,
            avatarUrl: user.avatarUrl ?? null
        }
    }
}