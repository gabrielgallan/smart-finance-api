import { Member } from '../../enterprise/entities/member'

export abstract class IMembersRepository {
  abstract create(member: Member): Promise<void>
  abstract findById(id: string): Promise<Member | null>
  abstract findByDocument(document: string): Promise<Member | null>
  abstract findByEmail(email: string): Promise<Member | null>
  abstract save(member: Member): Promise<Member>
}
