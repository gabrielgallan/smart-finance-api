import { ICategoriesRepository } from "@/domain/finances/application/repositories/categories-repository";
import { Category } from "@/domain/finances/enterprise/entites/category";
import { Injectable } from "@nestjs/common";

/* eslint-disable */
@Injectable()
export class PrismaCategoriesRepository implements ICategoriesRepository {
    create(category: Category): Promise<void> {
        throw new Error("Method not implemented.");
    }
    findById(id: string): Promise<Category | null> {
        throw new Error("Method not implemented.");
    }
    findByAccountIdAndSlug(accountId: string, slug: string): Promise<Category | null> {
        throw new Error("Method not implemented.");
    }
    findManyByAccountId(accountId: string): Promise<Category[]> {
        throw new Error("Method not implemented.");
    }
    save(category: Category): Promise<Category> {
        throw new Error("Method not implemented.");
    }
    deleteAllByAccountId(accountId: string): Promise<number> {
        throw new Error("Method not implemented.");
    }
}