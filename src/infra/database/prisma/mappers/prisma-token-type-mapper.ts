import { TokenType as PrismaTokenType } from '@prisma/client'
import { TokenType } from '@/domain/identity/enterprise/entities/token'

export class PrismaTokenTypeMapper {
  static toDomain(type: PrismaTokenType): TokenType {
    return type as unknown as TokenType
  }

  static toPrisma(type: TokenType): PrismaTokenType {
    return type as unknown as PrismaTokenType
  }
}