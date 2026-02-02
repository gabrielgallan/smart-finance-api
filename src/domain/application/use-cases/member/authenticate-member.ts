import { UniqueEntityID } from "@/core/entities/unique-entity-id"
import { IMembersRepository } from "../../repositories/members-repository"
import { ResourceNotFoundError } from "../errors/resource-not-found-error"
import { compare } from "bcryptjs"
import { InvalidCredentialsError } from "../errors/invalid-credentials-error"

interface AuthenticateMemberUseCaseRequest{
    email: string
    password: string
}

interface AuthenticateMemberUseCaseResponse{
    memberId: UniqueEntityID
}

export class AuthenticateMemberUseCase {
    constructor(
        private membersRepository: IMembersRepository
    ) {}

    async execute({
        email,
        password
    }: AuthenticateMemberUseCaseRequest): Promise<AuthenticateMemberUseCaseResponse> {
        const memberWithEmail = await this.membersRepository.findByEmail(email)

        if (!memberWithEmail) {
            throw new ResourceNotFoundError()
        }

        const isPasswordCorrect = await compare(password, memberWithEmail.password.value)

        if (!isPasswordCorrect) {
            throw new InvalidCredentialsError()
        }

        return {
            memberId: memberWithEmail.id
        }
    }
}