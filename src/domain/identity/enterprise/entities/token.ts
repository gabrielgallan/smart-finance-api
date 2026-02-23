import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

interface TokenProps {
  userId: UniqueEntityID
  type: 'PASSWORD_RECOVER'
  usedAt?: Date | null
  expiresAt: Date
  createdAt: Date
}

export class Token extends Entity<TokenProps> {
  static create(
    props: Optional<TokenProps, 'createdAt' | 'usedAt'>,
    id?: UniqueEntityID,
  ) {
    const token = new Token(
      {
        ...props,
        usedAt: props.usedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return token
  }
}