import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RegisterController } from './http/controllers/register.controller'
import { PrismaService } from './prisma/prisma.service'
import { envSchema } from './env'
import { AuthModule } from './auth/auth.module'
import { AuthenticateController } from './http/controllers/authenticate.controller'
import { GetProfileController } from './http/controllers/get-profile.controller'

@Module({
  imports: [ConfigModule.forRoot({
    validate: env => envSchema.parse(env),
    isGlobal: true
  }),
    AuthModule,
  ],
  controllers: [
    RegisterController,
    AuthenticateController,
    GetProfileController
  ],
  providers: [
    PrismaService,
  ],
})

export class AppModule { }
