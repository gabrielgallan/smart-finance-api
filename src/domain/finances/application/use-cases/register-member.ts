import dayjs from 'dayjs'
import { Member } from '../../enterprise/entites/member'
import { InvalidMemberAgeError } from './errors/invalid-member-age-erros'
import { IMembersRepository } from '../repositories/members-repository'
import { MemberAlreadyExistsError } from './errors/member-already-exists-error'
import { Hash } from '@/domain/finances/enterprise/entites/value-objects/hash'
import { Either, left, right } from '@/core/types/either'
import { Injectable } from '@nestjs/common'

interface RegisterMemberUseCaseRequest {
  name: string
  birthDate: Date
  document?: string
  email: string
  password: string
}

type RegisterMemberUseCaseResponse = Either<
  InvalidMemberAgeError | MemberAlreadyExistsError,
  { member: Member }
>

@Injectable()
export class RegisterMemberUseCase {
  constructor(private membersRepository: IMembersRepository) {}

  async execute({
    name,
    birthDate,
    document,
    email,
    password,
  }: RegisterMemberUseCaseRequest): Promise<RegisterMemberUseCaseResponse> {
    const birthDateJS = dayjs(birthDate)
    const nowDateJS = dayjs()

    const memberAge = nowDateJS.diff(birthDateJS, 'year')

    if (memberAge < 16) {
      return left(new InvalidMemberAgeError())
    }

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
      birthDate,
      document,
      email,
      password: await Hash.create(password),
    })

    await this.membersRepository.create(member)

    return right({
      member,
    })
  }
}
