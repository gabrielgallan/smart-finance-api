import { Category } from '../../enterprise/entities/category'

export abstract class ICategoriesRepository {
  abstract create(category: Category): Promise<void>
  abstract findByIdAndAccountId(id: string, accountId: string): Promise<Category | null>
  abstract findByAccountIdAndSlug(
    accountId: string,
    slug: string,
  ): Promise<Category | null>
  abstract findManyByAccountId(accountId: string): Promise<Category[]>
  abstract save(category: Category): Promise<Category>
  abstract deleteAllByAccountId(accountId: string): Promise<number>
}