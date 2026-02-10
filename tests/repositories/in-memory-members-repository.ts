import { Member } from "@/domain/finances/enterprise/entites/member";
import { IMembersRepository } from "@/domain/finances/application/repositories/members-repository";

export class InMemoryMembersRepository implements IMembersRepository {
    public items: Member[] = []
    
    async create(member: Member) {
        this.items.push(member)
        
        return
    }

    async findById(id: string) {
        const member = this.items.find(m => m.id.toString() === id)
        
        if (!member) return null

        return member
    }
    
    async findByDocument(document: string) {
        const member = this.items.find(m => m.document === document)
        
        if (!member) return null
        
        return member
    }
    
    async findByEmail(email: string) {
        const member = this.items.find(m => m.email === email)
        
        if (!member) return null
        
        return member
    }
    
    async findByAccountId(accountId: string) {
        const member = this.items.find(m => m.accountId?.toString() === accountId)

        return member ?? null
    }

    async save(member: Member) {
        const memberIndex = this.items.findIndex(m => m.id.toString() === member.id.toString())
        
        if (memberIndex >= 0) {
            this.items[memberIndex] = member
        }

        return member
    }
}