import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Entity } from '@/core/entities/entity'
import { Hash } from './value-objects/hash'
import { Optional } from '@/core/types/optional'

export interface MemberProps {
  accountId?: UniqueEntityID
  name: string
  age: number
  document: string
  email: string
  password: Hash
  createdAt: Date
}

export class Member extends Entity<MemberProps> {
  static create(
    props: Optional<MemberProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const member = new Member(
      {
        ...props,
        createdAt: new Date(),
      },
      id,
    )

    return member
  }

  // => GETTERS
  get email() {
    return this.props.email
  }

  get document() {
    return this.props.document
  }

  get password() {
    return this.props.password
  }

  // => SETTERS
  set email(email: string) {
    this.email = email
  }

  set password(passwordHash: Hash) {
    this.password = passwordHash
  }
}
