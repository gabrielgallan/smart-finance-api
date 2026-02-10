import { Member } from '../../enterprise/entites/member'

export interface IMembersRepository {
  create(member: Member): Promise<void>
  findById(id: string): Promise<Member | null>
  findByDocument(document: string): Promise<Member | null>
  findByEmail(email: string): Promise<Member | null>
  findByAccountId(accountId: string): Promise<Member | null>
  save(member: Member): Promise<Member>
}
