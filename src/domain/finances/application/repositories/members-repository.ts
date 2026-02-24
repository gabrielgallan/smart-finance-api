import { Member } from '../../enterprise/entities/member'

export abstract class IMembersRepository {
  abstract findById(id: string): Promise<Member | null>
}
