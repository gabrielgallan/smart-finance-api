import { Member } from "@/domain/finances/enterprise/entities/member";

export interface MemberPresenterToHTTP {
    name: string,
    email: string,
    document: string | null
}

export class MemberPresenter {
    static toHTTP(member: Member): MemberPresenterToHTTP {
        return {
            name: member.name,
            email: member.email,
            document: member.document ?? null
        }
    }
}