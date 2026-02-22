import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Category } from "@/domain/finances/enterprise/entities/category";
import { Slug } from "@/domain/finances/enterprise/entities/value-objects/slug";
import { Category as PrismaCategory, Prisma } from "@prisma/client"

export class PrismaCategoryMapper {
    static toDomain(raw: PrismaCategory): Category {
        return Category.create(
            {
                accountId: new UniqueEntityID(raw.accountId),
                name: raw.name,
                slug: new Slug(raw.slug),
                description: raw.description,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt
            },
            new UniqueEntityID(raw.id)
        )
    }

    static toPrisma(category: Category): Prisma.CategoryUncheckedCreateInput {
        return {
            id: category.id.toString(),
            accountId: category.accountId.toString(),
            name: category.name,
            slug: category.slug.value,
            description: category.description,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt ?? undefined
        }
    }
}