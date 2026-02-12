/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RegisterController } from './controllers/register.controller';
import { RegisterMemberUseCase } from '@/domain/finances/application/use-cases/register-member';
import { AuthenticateController } from './controllers/authenticate.controller';
import { GetProfileController } from './controllers/get-profile.controller';
import { OpenAccountController } from './controllers/open-account.controller';
import { AuthenticateMemberUseCase } from '@/domain/finances/application/use-cases/authenticate-member';
import { GetMemberProfileUseCase } from '@/domain/finances/application/use-cases/get-member-profile';
import { OpenAccountUseCase } from '@/domain/finances/application/use-cases/open-account';
import { AuthModule } from '../auth/auth.module';
import { CategoryController } from './controllers/category.controller';
import { CreateAccountCategoryUseCase } from '@/domain/finances/application/use-cases/create-account-category';
import { ListAccountCategoriesUseCase } from '@/domain/finances/application/use-cases/list-account-categories';

@Module({
    imports: [
        AuthModule,
        DatabaseModule
    ],
    controllers: [
        RegisterController,
        AuthenticateController,
        GetProfileController,
        OpenAccountController,
        CategoryController
    ],
    providers: [
        RegisterMemberUseCase,
        AuthenticateMemberUseCase,
        GetMemberProfileUseCase,
        OpenAccountUseCase,
        CreateAccountCategoryUseCase,
        ListAccountCategoriesUseCase
    ]
})
export class HttpModule {}
