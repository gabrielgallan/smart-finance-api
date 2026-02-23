import { Category } from "@/domain/finances/enterprise/entities/category";

export class CategoryPresenter {
    static toHTTP(category: Category) {
        return {
            id: category.id.toString(),
            name: category.name,
            slug: category.slug.value,
            description: category.description
        }
    }
}