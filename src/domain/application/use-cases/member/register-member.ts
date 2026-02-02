import dayjs from "dayjs"
import { Member } from "../../../enterprise/entites/member"
import { InvalidMemberAgeError } from "../errors/invalid-member-age-erros"
import { IMembersRepository } from "../../repositories/members-repository"
import { MemberAlreadyExistsError } from "../errors/member-already-exists-error"
import { Hash } from "@/domain/enterprise/entites/value-objects/hash"

interface RegisterMemberUseCaseRequest{
    name: string
    birthDate: Date
    document: string
    email: string
    password: string
}

interface RegisterMemberUseCaseResponse{
    member: Member
}

export class RegisterMemberUseCase {
    constructor(
        private membersRepository: IMembersRepository
    ) {}

    async execute({
        name,
        birthDate,
        document,
        email,
        password
    }: RegisterMemberUseCaseRequest): Promise<RegisterMemberUseCaseResponse> {
        const birthDateJS = dayjs(birthDate)
        const nowDateJS = dayjs()

        const memberAge = nowDateJS.diff(birthDateJS, 'year')

        if (memberAge < 16) {
            throw new InvalidMemberAgeError()
        }

        const memberWithSabeDocument = await this.membersRepository.findByDocument(document)

        if (memberWithSabeDocument) {
            throw new MemberAlreadyExistsError()
        }

        const memberWithSabeEmail = await this.membersRepository.findByEmail(email)

        if (memberWithSabeEmail) {
            throw new MemberAlreadyExistsError()
        }

        const member = Member.create({
            name,
            age: memberAge,
            document,
            email,
            password: await Hash.crate(password)
        })

        await this.membersRepository.create(member)

        return {
            member
        }
    }
}