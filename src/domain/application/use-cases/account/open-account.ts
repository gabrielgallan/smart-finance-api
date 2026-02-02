import { IMembersRepository } from "../../repositories/members-repository"
import { Account } from "@/domain/enterprise/entites/account"
import { IAccountsRepository } from "../../repositories/accounts-repository"
import { ResourceNotFoundError } from "../errors/resource-not-found-error"
import { MemberAlreadyHasAccountError } from "../errors/member-alredy-has-account-error"

interface OpenAccountrUseCaseRequest{
    memberId: string
}

interface OpenAccountrUseCaseResponse{
    account: Account
}

export class OpenAccountrUseCase {
    constructor(
        private membersRepository: IMembersRepository,
        private accountRepository: IAccountsRepository
    ) {}

    async execute({
        memberId
    }: OpenAccountrUseCaseRequest): Promise<OpenAccountrUseCaseResponse> {
        const member = await this.membersRepository.findById(memberId)

        if (!member) {
            throw new ResourceNotFoundError()
        }

        const memberAccount = await this.accountRepository.findByHolderId(memberId)

        if (memberAccount) {
            throw new MemberAlreadyHasAccountError()
        }

        const account = Account.create({
            holderId: member.id,
            balance: 0
        })

        await this.accountRepository.create(account)

        return {
            account
        }
    }
}