import { Member } from "@/domain/finances/enterprise/entites/member";

export class MemberPresenter {
    static toHTTP(member: Member) {
        return {
            name: member.name,
            email: member.email,
            document: member.document
        }
    }
}