import { ICategoriesRepository } from "@/domain/finances/application/repositories/categories-repository";
import { Category } from "@/domain/finances/enterprise/entites/category";

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

    async deleteAllByAccountId(accountId: string) {
        const originalLenght = this.items.length

        const remaining = this.items.filter(a => a.accountId.toString() !== accountId)

        this.items = remaining

        return originalLenght - remaining.length
    }
}