import { Member } from "@/domain/enterprise/entites/member"
import { IMembersRepository } from "../../repositories/members-repository"
import { ResourceNotFoundError } from "../errors/resource-not-found-error"

interface GetMemberProfileUseCaseRequest{
    memberId: string
}

interface GetMemberProfileUseCaseResponse{
    member: Member
}

export class GetMemberProfileUseCase {
    constructor(
        private membersRepository: IMembersRepository
    ) {}

    async execute({
        memberId
    }: GetMemberProfileUseCaseRequest): Promise<GetMemberProfileUseCaseResponse> {
        const member = await this.membersRepository.findById(memberId)

        if (!member) {
            throw new ResourceNotFoundError()
        }

        return {
            member
        }
    }
}