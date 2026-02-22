import { DateInterval } from "@/core/types/repositories/date-interval";
import { Pagination } from "@/core/types/repositories/pagination";
import { ITransactionsRepository } from "@/domain/finances/application/repositories/transactions-repository";
import { Transaction } from "@/domain/finances/enterprise/entities/transaction";
import { Injectable } from "@nestjs/common";

/* eslint-disable */
@Injectable()
export class PrismaTransactionsRepository implements ITransactionsRepository {
    create(transaction: Transaction): Promise<void> {
        throw new Error("Method not implemented.");
    }
    findById(id: string): Promise<Transaction | null> {
        throw new Error("Method not implemented.");
    }
    listRecentByAccountId(accountId: string, pagination: Pagination): Promise<Transaction[]> {
        throw new Error("Method not implemented.");
    }
    listByIntervalAndAccountId(accountId: string, interval: DateInterval, pagination: Pagination): Promise<Transaction[]> {
        throw new Error("Method not implemented.");
    }
    listByIntervalAndAccountIdAndCategory(accountId: string, categoryId: string, interval: DateInterval, pagination: Pagination): Promise<Transaction[]> {
        throw new Error("Method not implemented.");
    }
    findManyByAccountIdAndInterval(accountId: string, interval: DateInterval): Promise<Transaction[]> {
        throw new Error("Method not implemented.");
    }
    findManyByAccountIdAndIntervalAndCategory(accountId: string, categoryId: string, interval: DateInterval): Promise<Transaction[]> {
        throw new Error("Method not implemented.");
    }
    save(transaction: Transaction): Promise<Transaction> {
        throw new Error("Method not implemented.");
    }
    deleteAllByAccountId(accountId: string): Promise<number> {
        throw new Error("Method not implemented.");
    }

}