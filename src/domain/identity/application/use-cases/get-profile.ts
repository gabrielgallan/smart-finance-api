import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { Injectable } from '@nestjs/common'
import { User } from '../../enterprise/entities/user'
import { UsersRepository } from '../repositories/users-repository'

interface GetProfileUseCaseRequest {
  userId: string
}

type GetProfileUseCaseResponse = Either<
  ResourceNotFoundError,
  { user: User }
>

@Injectable()
export class GetProfileUseCase {
  constructor(private usersRepository: UsersRepository) { }

  async execute({
    userId,
  }: GetProfileUseCaseRequest): Promise<GetProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError())
    }

    return right({
      user,
    })
  }
}
