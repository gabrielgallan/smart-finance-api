import { Member } from "@/domain/finances/enterprise/entities/member";
import { IMembersRepository } from "@/domain/finances/application/repositories/members-repository";

export class InMemoryMembersRepository implements IMembersRepository {
    public items: Member[] = []

    async findById(id: string) {
        const member = this.items.find(m => m.id.toString() === id)

        if (!member) return null

        return member
    }
}