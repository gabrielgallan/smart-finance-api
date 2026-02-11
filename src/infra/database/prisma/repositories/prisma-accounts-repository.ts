import { IAccountsRepository } from "@/domain/finances/application/repositories/accounts-repository";
import { Account } from "@/domain/finances/enterprise/entites/account";
import { Injectable } from "@nestjs/common";

/* eslint-disable */
@Injectable()
export class PrismaAccountsRepository implements IAccountsRepository {
    create(Account: Account): Promise<void> {
        throw new Error("Method not implemented.");
    }
    findById(id: string): Promise<Account | null> {
        throw new Error("Method not implemented.");
    }
    findByHolderId(holderId: string): Promise<Account | null> {
        throw new Error("Method not implemented.");
    }
    save(account: Account): Promise<Account> {
        throw new Error("Method not implemented.");
    }
    delete(account: Account): Promise<number> {
        throw new Error("Method not implemented.");
    }

}