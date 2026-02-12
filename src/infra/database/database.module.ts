/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaMembersRepository } from './prisma/repositories/prisma-members-repository';
import { PrismaAccountsRepository } from './prisma/repositories/prisma-accounts-repository';
import { PrismaCategoriesRepository } from './prisma/repositories/prisma-categories-repository';
import { PrismaTransactionsRepository } from './prisma/repositories/prisma-transactions-repository';
import { IMembersRepository } from '@/domain/finances/application/repositories/members-repository';
import { IAccountsRepository } from '@/domain/finances/application/repositories/accounts-repository';
import { ICategoriesRepository } from '@/domain/finances/application/repositories/categories-repository';
import { ITransactionsRepository } from '@/domain/finances/application/repositories/transactions-repository';

@Module({
    providers: [
        PrismaService,
        {
            provide: IMembersRepository,
            useClass: PrismaMembersRepository
        },
        {
            provide: IAccountsRepository,
            useClass: PrismaAccountsRepository
        },
        {
            provide: ICategoriesRepository,
            useClass: PrismaCategoriesRepository
        },
        {
            provide: ITransactionsRepository,
            useClass: PrismaTransactionsRepository
        }
    ],
    exports: [
        PrismaService,
        IMembersRepository,
        IAccountsRepository,
        ICategoriesRepository,
        ITransactionsRepository
    ],
})
export class DatabaseModule {}
