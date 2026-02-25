import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { Encrypter } from '@/domain/identity/application/cryptography/encrypter';
import { JwtEncrypter } from '../cryptography/jwt-encrypter';
import { Hasher } from '@/domain/identity/application/cryptography/hasher';
import { BcryptHasher } from '../cryptography/bcrypt-hasher';
import { GithubOAuthProvider } from './github-oauth-provider';
import { EnvService } from '../env/env.service';
import { EnvModule } from '../env/env.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth-guard';
import { ExternalAuthProvider } from '@/domain/identity/application/auth/auth-provider';

@Module({
  imports: [
    EnvModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory(env: EnvService) {
        const privateKey = env.get('JWT_PRIVATE_KEY')
        const publicKey = env.get('JWT_PUBLIC_KEY')

        return {
          signOptions: { algorithm: 'RS256' },
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64')
        }
      }
    })
  ],
  exports: [JwtModule, Encrypter, Hasher, ExternalAuthProvider],
  providers: [
    JwtStrategy,
    {
      provide: ExternalAuthProvider,
      useClass: GithubOAuthProvider
    },
    {
      provide: Encrypter,
      useClass: JwtEncrypter
    },
    {
      provide: Hasher,
      useClass: BcryptHasher
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ]
})
export class AuthModule { }
