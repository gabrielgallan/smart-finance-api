import { Member } from '@/domain/finances/enterprise/entites/member'
import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { Injectable } from '@nestjs/common'

interface GetMemberProfileUseCaseRequest {
  memberId: string
}

type GetMemberProfileUseCaseResponse = Either<
  ResourceNotFoundError,
  { member: Member }
>

@Injectable()
export class GetMemberProfileUseCase {
  constructor(private membersRepository: IMembersRepository) {}

  async execute({
    memberId,
  }: GetMemberProfileUseCaseRequest): Promise<GetMemberProfileUseCaseResponse> {
    const member = await this.membersRepository.findById(memberId)

    if (!member) {
      return left(new ResourceNotFoundError())
    }

    return right({
      member,
    })
  }
}
