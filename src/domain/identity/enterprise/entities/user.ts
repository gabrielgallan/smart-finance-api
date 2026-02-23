import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

interface UserProps {
    name?: string | null
    email: string
    passwordHash?: string | null
    avatarUrl?: string | null
    createdAt: Date
    updatedAt?: Date | null
}

export class User extends Entity<UserProps> {
    static create(
        props: Optional<UserProps, 'createdAt' | 'updatedAt'>,
        id?: UniqueEntityID,
      ) {
        const user = new User(
          {
            ...props,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? null,
          },
          id,
        )
    
        return user
      }
}