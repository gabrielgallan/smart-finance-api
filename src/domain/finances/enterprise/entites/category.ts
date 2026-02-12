import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { Slug } from './value-objects/slug'

export interface CategoryProps {
  accountId: UniqueEntityID
  name: string
  slug: Slug
  description?: string | null
  createdAt: Date
  updatedAt?: Date | null
}

export class Category extends Entity<CategoryProps> {
  static create(
    props: Optional<CategoryProps, 'createdAt' | 'slug' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    const category = new Category(
      {
        ...props,
        slug: props.slug ?? Slug.createFromText(props.name),
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    )

    return category
  }

  // => Getters
  get name() {
    return this.props.name
  }

  get description() {
    return this.props.description
  }

  get slug() {
    return this.props.slug
  }

  get accountId() {
    return this.props.accountId
  }

  // => Setters
  set name(name: string) {
    this.props.name = name
    this.props.slug = Slug.createFromText(name)

    this.touch()
  }

  set description(description: string | undefined | null) {
    this.props.description = description

    this.touch()
  }

  // => Methods
  private touch() {
    this.props.updatedAt = new Date()
  }
}
