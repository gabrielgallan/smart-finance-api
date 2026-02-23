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
import { CloseAccountController } from './controllers/account/close-account.controller'
import { GetRollingYearProgressController } from './controllers/summary/get-rolling-year-progress.controller'
import { AuthenticateWithGithubController } from './controllers/authentication/authenticate-with-github.controller'
import { RequestPasswordRecoverController } from './controllers/authentication/request-password-recover.controller'
import { GetSummariesByCategoriesController } from './controllers/summary/get-summaries-by-categories.controller'
import { ResetPasswordController } from './controllers/authentication/reset-password.controller'
import { CreateTransactionController } from './controllers/transactions/create-transaction.controller'
import { ListAccountTransactionsController } from './controllers/transactions/list-transactions.controller'
import { EditAccountTransactionController } from './controllers/transactions/edit-transaction.controller'
import { GetAccountSummaryController } from './controllers/summary/get-account-summary.controller'

// use-cases
import { RegisterMemberUseCase } from '@/domain/finances/application/use-cases/register-member'
import { AuthenticateMemberUseCase } from '@/domain/finances/application/use-cases/authenticate-member'
import { GetMemberProfileUseCase } from '@/domain/finances/application/use-cases/get-member-profile'
import { OpenAccountUseCase } from '@/domain/finances/application/use-cases/open-account'
import { CreateAccountCategoryUseCase } from '@/domain/finances/application/use-cases/create-account-category'
import { ListAccountCategoriesUseCase } from '@/domain/finances/application/use-cases/list-account-categories'
import { EditAccountCategoryUseCase } from '@/domain/finances/application/use-cases/edit-account-category'
import { CloseAccountUseCase } from '@/domain/finances/application/use-cases/close-account'
import { ResetMemberPasswordUseCase } from '@/domain/finances/application/use-cases/reset-member-password'
import { CreateTransactionUseCase } from '@/domain/finances/application/use-cases/create-transaction'
import { ListAccountTransactionsUseCase } from '@/domain/finances/application/use-cases/list-account-transactions'
import { EditTransactionUseCase } from '@/domain/finances/application/use-cases/edit-transaction'
import { GetAccountSummaryUseCase } from '@/domain/finances/application/use-cases/get-account-summary'
import { GetAccountSummariesByCategoriesUseCase } from '@/domain/finances/application/use-cases/get-account-summaries-by-categories'
import { FinancialAnalyticsService } from '@/domain/finances/application/services/financial-analytics/financial-analytics-service'
import { GetRollingYearProgressUseCase } from '@/domain/finances/application/use-cases/get-rolling-yearly-progress'
import { EmailService } from '../email/email.service'
import { EnvModule } from '../env/env.module'

@Module({
    imports: [
        AuthModule,
        DatabaseModule,
        EnvModule
    ],
    controllers: [
        RegisterController,
        AuthenticateController,
        AuthenticateWithGithubController,
        GetProfileController,
        RequestPasswordRecoverController,
        ResetPasswordController,
        OpenAccountController,
        CloseAccountController,
        CategoryController,
        CreateTransactionController,
        ListAccountTransactionsController,
        EditAccountTransactionController,
        GetAccountSummaryController,
        GetSummariesByCategoriesController,
        GetRollingYearProgressController
    ],
    providers: [
        RegisterMemberUseCase,
        AuthenticateMemberUseCase,
        GetMemberProfileUseCase,
        ResetMemberPasswordUseCase,
        OpenAccountUseCase,
        CloseAccountUseCase,
        CreateAccountCategoryUseCase,
        ListAccountCategoriesUseCase,
        EditAccountCategoryUseCase,
        CreateTransactionUseCase,
        ListAccountTransactionsUseCase,
        EditTransactionUseCase,
        GetAccountSummaryUseCase,
        GetAccountSummariesByCategoriesUseCase,
        GetRollingYearProgressUseCase,
        FinancialAnalyticsService,
        EmailService,
    ]
})
export class HttpModule { }
