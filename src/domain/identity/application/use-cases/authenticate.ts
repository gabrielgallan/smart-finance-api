import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { Either, left, right } from '@/core/types/either'
import { Injectable } from '@nestjs/common'
import { Hasher } from '../cryptography/hasher'
import { Encrypter } from '../cryptography/encrypter'
import { UsersRepository } from '../repositories/users-repository'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

type AuthenticateUseCaseResponse = Either<
  InvalidCredentialsError,
  { token: string }
>

@Injectable()
export class AuthenticateUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hasher: Hasher,
    private encrypter: Encrypter
  ) { }

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const userFromEmail = await this.usersRepository.findByEmail(email)

    if (!userFromEmail || !userFromEmail.passwordHash) {
      return left(new InvalidCredentialsError())
    }

    const isPasswordCorrect = await this.hasher.compare(
      password,
      userFromEmail.passwordHash
    )

    if (!isPasswordCorrect) {
      return left(new InvalidCredentialsError())
    }

    const token = await this.encrypter.encrypt({ sub: userFromEmail.id.toString() })

    return right({
      token
    })
  }
}
