import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { MemberAlreadyExistsError } from './errors/member-already-exists-error'
import { Hash } from '@/domain/finances/enterprise/entites/value-objects/hash'

interface EditMemberProfileUseCaseRequest {
  memberId: string
  email?: string
  password?: string
}

type EditMemberProfileUseCaseResponse = Either<
  ResourceNotFoundError | MemberAlreadyExistsError,
  null
>

export class EditMemberProfileUseCase {
  constructor(private membersRepository: IMembersRepository) {}

  async execute({
    memberId,
    email,
    password,
  }: EditMemberProfileUseCaseRequest): Promise<EditMemberProfileUseCaseResponse> {
    const member = await this.membersRepository.findById(memberId)

    if (!member) {
      return left(new ResourceNotFoundError())
    }

    if (email) {
      const memberWithSameEmail =
        await this.membersRepository.findByEmail(email)

      if (
        memberWithSameEmail &&
        memberWithSameEmail.id.toString() !== memberId
      ) {
        return left(new MemberAlreadyExistsError())
      }

      member.email = email
    }

    if (password) {
      member.password = await Hash.create(password)
    }

    await this.membersRepository.save(member)

    return right(null)
  }
}
