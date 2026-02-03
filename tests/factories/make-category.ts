import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Category, CategoryProps } from "@/domain/enterprise/entites/category";

export async function makeCategory(
    override: Partial<CategoryProps> = {},
    id?: UniqueEntityID
) {
    const category = Category.create({
        accountId: new UniqueEntityID(),
        name: 'Generic',
        ...override
    }, id)

    return category
}