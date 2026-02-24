import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Entity } from '@/core/entities/entity'

export interface MemberProps {
  accountId?: UniqueEntityID | null
}

export class Member extends Entity<MemberProps> {
  static create(
    props: MemberProps,
    id?: UniqueEntityID,
  ) {
    return new Member(
      props,
      id,
    )
  }
}