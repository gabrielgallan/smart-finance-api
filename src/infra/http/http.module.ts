/*
https://docs.nestjs.com/modules
*/

// modules
import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { DatabaseModule } from '../database/database.module'

// controllers
import { RegisterController } from './controllers/authentication/register.controller'
import { AuthenticateController } from './controllers/authentication/authenticate.controller'
import { GetProfileController } from './controllers/member/get-profile.controller'
import { OpenAccountController } from './controllers/account/open-account.controller'
import { CategoryController } from './controllers/category/category.controller'

// use-cases
import { RegisterMemberUseCase } from '@/domain/finances/application/use-cases/register-member'
import { AuthenticateMemberUseCase } from '@/domain/finances/application/use-cases/authenticate-member'
import { GetMemberProfileUseCase } from '@/domain/finances/application/use-cases/get-member-profile'
import { OpenAccountUseCase } from '@/domain/finances/application/use-cases/open-account'
import { CreateAccountCategoryUseCase } from '@/domain/finances/application/use-cases/create-account-category'
import { ListAccountCategoriesUseCase } from '@/domain/finances/application/use-cases/list-account-categories'
import { EditAccountCategoryUseCase } from '@/domain/finances/application/use-cases/edit-account-category'

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
        ListAccountCategoriesUseCase,
        EditAccountCategoryUseCase
    ]
})
export class HttpModule {}
