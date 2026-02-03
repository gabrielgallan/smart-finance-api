import { ICategoriesRepository } from "@/domain/application/repositories/categories-repository";
import { Category } from "@/domain/enterprise/entites/category";

export class InMemoryCategoriesRepository implements ICategoriesRepository {
    private items: Category[] = []

    async create(category: Category) {
        this.items.push(category)
        return
    }

    async findById(id: string) {
        const category = await this.items.find((c) => c.id.toString() === id)

        return category ?? null
    }

    async findByAccountIdAndSlug(accountId: string, slug: string) {
        const category = await this.items.find((c) => {
            return (c.accountId.toString() === accountId && c.slug.value === slug)
        })

        return category ?? null
    }
}