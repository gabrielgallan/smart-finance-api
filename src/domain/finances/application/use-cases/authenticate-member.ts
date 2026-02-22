import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { Either, left, right } from '@/core/types/either'
import { Injectable } from '@nestjs/common'
import { Hasher } from '../criptography/hasher'

interface AuthenticateMemberUseCaseRequest {
  email: string
  password: string
}

type AuthenticateMemberUseCaseResponse = Either<
  ResourceNotFoundError | InvalidCredentialsError,
  { memberId: UniqueEntityID }
>

@Injectable()
export class AuthenticateMemberUseCase {
  constructor(
    private membersRepository: IMembersRepository,
    private hasher: Hasher
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateMemberUseCaseRequest): Promise<AuthenticateMemberUseCaseResponse> {
    const memberWithEmail = await this.membersRepository.findByEmail(email)

    if (!memberWithEmail) {
      return left(new ResourceNotFoundError())
    }

    const isPasswordCorrect = await this.hasher.compare(
      password, 
      memberWithEmail.password
    )

    if (!isPasswordCorrect) {
      return left(new InvalidCredentialsError())
    }

    return right({
      memberId: memberWithEmail.id,
    })
  }
}
