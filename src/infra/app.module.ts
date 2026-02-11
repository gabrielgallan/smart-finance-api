import { DatabaseModule } from './database/database.module';
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RegisterController } from './http/controllers/register.controller'
import { envSchema } from './env'
import { AuthModule } from './auth/auth.module'
import { AuthenticateController } from './http/controllers/authenticate.controller'
import { GetProfileController } from './http/controllers/get-profile.controller'
import { OpenAccountController } from './http/controllers/open-account.controller'

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      validate: env => envSchema.parse(env),
      isGlobal: true
    }),
    AuthModule,
  ],
  controllers: [
    RegisterController,
    AuthenticateController,
    GetProfileController,
    OpenAccountController
  ],
})
export class AppModule {}
