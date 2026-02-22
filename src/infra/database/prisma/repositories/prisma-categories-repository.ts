import { ICategoriesRepository } from "@/domain/finances/application/repositories/categories-repository";
import { Category } from "@/domain/finances/enterprise/entities/category";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PrismaCategoryMapper } from "../mappers/prisma-category-mapper";

/* eslint-disable */
@Injectable()
export class PrismaCategoriesRepository implements ICategoriesRepository {
    constructor(private prisma: PrismaService) {}

    async create(category: Category) {
        const data = PrismaCategoryMapper.toPrisma(category)

        const prismaCategory = await this.prisma.category.create({
            data
        })

        return
    }

    async findById(id: string) {
        const prismaCategory = await this.prisma.category.findUnique({
            where: { id }
        })

        if (!prismaCategory) {
            return null
        }

        return PrismaCategoryMapper.toDomain(prismaCategory)
    }

    async findByAccountIdAndSlug(accountId: string, slug: string) {
        const prismaCategory = await this.prisma.category.findFirst({
            where: {
                accountId,
                slug
            }
        })

        if (!prismaCategory) {
            return null
        }

        return PrismaCategoryMapper.toDomain(prismaCategory)
    }
    
    async findManyByAccountId(accountId: string) {
        const prismaCategories = await this.prisma.category.findMany({
            where: {
                accountId
            }
        })

        return prismaCategories.map(PrismaCategoryMapper.toDomain)
    }

    async save(category: Category) {
        const data = PrismaCategoryMapper.toPrisma(category)

        const updated = await this.prisma.category.update({
            where: { id: category.id.toString() },
            data
        })

        return PrismaCategoryMapper.toDomain(updated)
    }

    async deleteAllByAccountId(accountId: string) {
        const result = await this.prisma.category.deleteMany({
            where: {
                accountId
            }
        })

        return result.count
    }
}