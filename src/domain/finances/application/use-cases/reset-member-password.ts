import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { Hasher } from '../cryptography/hasher'
import { Injectable } from '@nestjs/common'

interface ResetMemberPasswordUseCaseRequest {
  memberId: string
  password: string
}

type ResetMemberPasswordUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class ResetMemberPasswordUseCase {
  constructor(
    private membersRepository: IMembersRepository,
    private hasher: Hasher
  ) {}

  async execute({
    memberId,
    password,
  }: ResetMemberPasswordUseCaseRequest): Promise<ResetMemberPasswordUseCaseResponse> {
    const member = await this.membersRepository.findById(memberId)

    if (!member) {
      return left(new ResourceNotFoundError())
    }

    member.password = await this.hasher.generate(password)

    await this.membersRepository.save(member)

    return right(null)
  }
}
