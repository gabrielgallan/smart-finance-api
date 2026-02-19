import { HttpModule } from './http/http.module';
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    AuthModule,
    HttpModule,
    ConfigModule.forRoot({
      validate: env => envSchema.parse(env),
      isGlobal: true
    })
  ]
})
export class AppModule {}
