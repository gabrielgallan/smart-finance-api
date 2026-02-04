import { Category } from '../../enterprise/entites/category'

export interface ICategoriesRepository {
  create(category: Category): Promise<void>
  findById(id: string): Promise<Category | null>
  findByAccountIdAndSlug(
    accountId: string,
    slug: string,
  ): Promise<Category | null>
}
