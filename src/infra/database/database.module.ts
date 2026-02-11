/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaMembersRepository } from './prisma/repositories/prisma-members-repository';
import { PrismaAccountsRepository } from './prisma/repositories/prisma-accounts-repository';
import { PrismaCategoriesRepository } from './prisma/repositories/prisma-categories-repository';
import { PrismaTransactionsRepository } from './prisma/repositories/prisma-transactions-repository';

@Module({
    providers: [
        PrismaService,
        PrismaMembersRepository,
        PrismaAccountsRepository,
        PrismaCategoriesRepository,
        PrismaTransactionsRepository
    ],
    exports: [
        PrismaService,
        PrismaMembersRepository,
        PrismaAccountsRepository,
        PrismaCategoriesRepository,
        PrismaTransactionsRepository
    ],
})
export class DatabaseModule {}
