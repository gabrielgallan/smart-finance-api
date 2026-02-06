import { ICategoriesRepository } from "@/domain/finance-manager/application/repositories/categories-repository";
import { Category } from "@/domain/finance-manager/enterprise/entites/category";

export class InMemoryCategoriesRepository implements ICategoriesRepository {
    public items: Category[] = []

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

    async findManyByAccountId(accountId: string) {
        const categories = this.items.filter(c => c.accountId.toString() === accountId)

        return categories
    }

    async save(category: Category) {
        const categoryIndex = this.items.findIndex(c => c.id.toString() === category.id.toString())

        if (categoryIndex >= 0) {
            this.items[categoryIndex] = category
        }

        return category
    }
}