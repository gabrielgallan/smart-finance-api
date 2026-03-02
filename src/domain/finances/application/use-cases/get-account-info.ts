import { Either, left, right } from '@/core/types/either'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { MemberAccountNotFoundError } from './errors/member-account-not-found-error'
import { Injectable } from '@nestjs/common'

interface GetAccountInfoUseCaseRequest {
    memberId: string
}

type GetAccountInfoUseCaseResponse = Either<
    MemberAccountNotFoundError,
    {
        balance: number,
        createdAt: Date,
        updatedAt: Date | null
    }
>

@Injectable()
export class GetAccountInfoUseCase {
    constructor(
        private accountsRepository: IAccountsRepository,
    ) { }

    async execute({
        memberId,
    }: GetAccountInfoUseCaseRequest): Promise<GetAccountInfoUseCaseResponse> {
        const account = await this.accountsRepository.findByHolderId(memberId)

        if (!account) {
            return left(new MemberAccountNotFoundError())
        }

        return right({
            balance: account.balance,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt ?? null
        })
    }
}