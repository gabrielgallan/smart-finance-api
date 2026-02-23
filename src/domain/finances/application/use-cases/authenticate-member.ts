import { IMembersRepository } from '../repositories/members-repository'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { Either, left, right } from '@/core/types/either'
import { Injectable } from '@nestjs/common'
import { Hasher } from '../cryptography/hasher'
import { Encrypter } from '../cryptography/encrypter'

interface AuthenticateMemberUseCaseRequest {
  email: string
  password: string
}

type AuthenticateMemberUseCaseResponse = Either<
  InvalidCredentialsError,
  { token: string }
>

@Injectable()
export class AuthenticateMemberUseCase {
  constructor(
    private membersRepository: IMembersRepository,
    private hasher: Hasher,
    private encrypter: Encrypter
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateMemberUseCaseRequest): Promise<AuthenticateMemberUseCaseResponse> {
    const member = await this.membersRepository.findByEmail(email)

    if (!member || !member.password) {
      return left(new InvalidCredentialsError())
    }

    const isPasswordCorrect = await this.hasher.compare(
      password, 
      member.password
    )

    if (!isPasswordCorrect) {
      return left(new InvalidCredentialsError())
    }

    const token = await this.encrypter.encrypt({ sub: member.id.toString() })

    return right({
      token
    })
  }
}
