import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Entity } from '@/core/entities/entity'
import { Optional } from '@/core/types/optional'

export interface MemberProps {
  name?: string | null
  document?: string | null
  email: string
  password?: string | null
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
  set name(name: string | null | undefined) {
    this.props.name = name
  }

  set email(email: string) {
    this.props.email = email
  }

  set password(password: string | null | undefined) {
    this.props.password = password
  }
}
