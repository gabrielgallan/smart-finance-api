import { Category } from '../../enterprise/entites/category'

export interface ICategoriesRepository {
  create(category: Category): Promise<void>
  findById(id: string): Promise<Category | null>
  findByAccountIdAndSlug(
    accountId: string,
    slug: string,
  ): Promise<Category | null>
  findManyByAccountId(accountId: string): Promise<Category[]>
  save(category: Category): Promise<Category>
  deleteAllByAccountId(accountId: string): Promise<number>
}
