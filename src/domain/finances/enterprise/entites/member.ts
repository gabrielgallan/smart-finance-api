import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Entity } from '@/core/entities/entity'
import { Hash } from './value-objects/hash'
import { Optional } from '@/core/types/optional'

export interface MemberProps {
  accountId?: UniqueEntityID
  name: string
  birthDate: Date
  document?: string
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

  get email() {
    return this.props.email
  }

  get document() {
    return this.props.document
  }

  get password() {
    return this.props.password
  }

  get accountId(): UniqueEntityID | undefined {
    return this.props.accountId
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

  set accountId(accountId: UniqueEntityID | undefined) {
    this.props.accountId = accountId
  }
}
