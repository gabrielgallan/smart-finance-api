import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Category, CategoryProps } from "@/domain/finances/enterprise/entities/category";
import { faker } from "@faker-js/faker"

export function makeCategory(
    override: Partial<CategoryProps> = {},
    id?: UniqueEntityID
) {
    const category = Category.create({
        accountId: new UniqueEntityID(),
        name: faker.lorem.words(2),
        ...override
    }, id)

    return category
}