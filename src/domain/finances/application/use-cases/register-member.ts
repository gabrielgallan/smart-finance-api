import { Member } from '../../enterprise/entities/member'
import { IMembersRepository } from '../repositories/members-repository'
import { MemberAlreadyExistsError } from './errors/member-already-exists-error'
import { Either, left, right } from '@/core/types/either'
import { Injectable } from '@nestjs/common'
import { Hasher } from '../criptography/hasher'

interface RegisterMemberUseCaseRequest {
  name: string
  document?: string
  email: string
  password: string
}

type RegisterMemberUseCaseResponse = Either<
  MemberAlreadyExistsError,
  { member: Member }
>

@Injectable()
export class RegisterMemberUseCase {
  constructor(
    private membersRepository: IMembersRepository,
    private hasher: Hasher
  ) {}

  async execute({
    name,
    document,
    email,
    password,
  }: RegisterMemberUseCaseRequest): Promise<RegisterMemberUseCaseResponse> {
    if (document) {
      const memberWithSabeDocument =
        await this.membersRepository.findByDocument(document)

      if (memberWithSabeDocument) {
        return left(new MemberAlreadyExistsError())
      }
    }

    const memberWithSabeEmail = await this.membersRepository.findByEmail(email)

    if (memberWithSabeEmail) {
      return left(new MemberAlreadyExistsError())
    }

    const member = Member.create({
      name,
      document,
      email,
      password: await this.hasher.generate(password),
    })

    await this.membersRepository.create(member)

    return right({
      member,
    })
  }
}
