import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Env } from '@/infra/env';
import { JwtStrategy } from './jwt.strategy';
import { Encrypter } from '@/domain/finances/application/cryptography/encrypter';
import { JwtEncrypter } from '../cryptography/jwt-encrypter';
import { Hasher } from '@/domain/finances/application/cryptography/hasher';
import { BcryptHasher } from '../cryptography/bcrypt-hasher';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
        inject: [ConfigService],
        useFactory(config: ConfigService<Env, true>) {
            const privateKey = config.get('JWT_PRIVATE_KEY', { infer: true })
            const publicKey = config.get('JWT_PUBLIC_KEY', { infer: true })

            return {
                signOptions: { algorithm: 'RS256' },
                privateKey: Buffer.from(privateKey, 'base64'),
                publicKey: Buffer.from(publicKey, 'base64')
            }
        }
    })
  ],
  exports: [JwtModule, Encrypter, Hasher],
  providers: [
    JwtStrategy,
    {
      provide: Encrypter,
      useClass: JwtEncrypter
    },
    {
      provide: Hasher,
      useClass: BcryptHasher
    }
  ]
})
export class AuthModule {}
