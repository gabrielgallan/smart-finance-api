import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Entity } from '@/core/entities/entity'
import { Optional } from '@/core/types/optional'

export interface MemberProps {
  name: string
  document?: string | null
  email: string
  password: string
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
  set email(email: string) {
    this.props.email = email
  }

  set password(password: string) {
    this.props.password = password
  }
}
