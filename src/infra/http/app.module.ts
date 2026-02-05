import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RegisterController } from './controllers/register.controller'
import { PrismaService } from '../prisma/prisma.service'
import { envSchema } from '../env'
import { AuthModule } from './auth/auth.module'
import { AuthenticateController } from './controllers/authenticate.controller'

@Module({
  imports: [ConfigModule.forRoot({
      validate: env => envSchema.parse(env),
      isGlobal: true
    }),
    AuthModule,
  ],
  controllers: [
    RegisterController,
    AuthenticateController
  ],
  providers: [
    PrismaService,
  ],
})

export class AppModule {}
