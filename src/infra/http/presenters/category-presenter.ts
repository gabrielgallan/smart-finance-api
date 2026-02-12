import { Category } from "@/domain/finances/enterprise/entites/category";

export class CategoryPresenter {
    static toHTTP(category: Category) {
        return {
            name: category.name,
            description: category.description
        }
    }
}