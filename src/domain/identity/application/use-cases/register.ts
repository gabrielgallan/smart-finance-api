import { Either, left, right } from '@/core/types/either'
import { Injectable } from '@nestjs/common'
import { Hasher } from '../cryptography/hasher'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { User } from '../../enterprise/entities/user'
import { UsersRepository } from '../repositories/users-repository'

interface RegisterUseCaseRequest {
  name: string
  email: string
  password: string
}

type RegisterUseCaseResponse = Either<
  UserAlreadyExistsError,
  { user: User }
>

@Injectable()
export class RegisterUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hasher: Hasher
  ) { }

  async execute({
    name,
    email,
    password,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail) {
      return left(new UserAlreadyExistsError())
    }

    const user = User.create({
      name,
      email,
      passwordHash: await this.hasher.generate(password),
    })

    await this.usersRepository.create(user)

    return right({
      user,
    })
  }
}
