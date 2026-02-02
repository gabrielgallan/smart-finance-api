import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { compare } from 'bcryptjs'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { Either, left, right } from '@/core/either'

interface AuthenticateMemberUseCaseRequest {
  email: string
  password: string
}

type AuthenticateMemberUseCaseResponse = Either<
  ResourceNotFoundError | InvalidCredentialsError,
  { memberId: UniqueEntityID }
>

export class AuthenticateMemberUseCase {
  constructor(private membersRepository: IMembersRepository) {}

  async execute({
    email,
    password,
  }: AuthenticateMemberUseCaseRequest): Promise<AuthenticateMemberUseCaseResponse> {
    const memberWithEmail = await this.membersRepository.findByEmail(email)

    if (!memberWithEmail) {
      return left(new ResourceNotFoundError())
    }

    const isPasswordCorrect = await compare(
      password,
      memberWithEmail.password.value,
    )

    if (!isPasswordCorrect) {
      return left(new InvalidCredentialsError())
    }

    return right({
      memberId: memberWithEmail.id,
    })
  }
}
