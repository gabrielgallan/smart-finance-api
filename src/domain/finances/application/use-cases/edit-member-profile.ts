import { IMembersRepository } from '../repositories/members-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { MemberAlreadyExistsError } from './errors/member-already-exists-error'
import { Hasher } from '../criptography/hasher'

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
  constructor(
    private membersRepository: IMembersRepository,
    private hasher: Hasher
  ) {}

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
      member.password = await this.hasher.generate(password)
    }

    await this.membersRepository.save(member)

    return right(null)
  }
}
