import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Entity } from '@/core/entities/entity'
import { Hash } from './value-objects/hash'
import { Optional } from '@/core/types/optional'

export interface MemberProps {
  name: string
  birthDate: Date
  document?: string | null
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
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return member
  }

  // => Getters
  get name() {
    return this.props.name
  }

  get birthDate() {
    return this.props.birthDate
  }

  get document() {
    return this.props.document
  }

  get email() {
    return this.props.email
  }

  get password() {
    return this.props.password
  }

  get createdAt() {
    return this.props.createdAt
  }

  // => Setters
  set email(email: string) {
    this.props.email = email
  }

  set password(passwordHash: Hash) {
    this.props.password = passwordHash
  }
}
