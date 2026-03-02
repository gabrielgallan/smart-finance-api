import { InMemoryAccountsRepository } from 'test/unit/repositories/in-memory-accounts-repository'
import { makeAccount } from 'test/unit/factories/make-account'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { GetAccountInfoUseCase } from './get-account-info'

let accountsRepository: InMemoryAccountsRepository

let sut: GetAccountInfoUseCase

describe('Get account info use case', () => {
    beforeEach(() => {
        accountsRepository = new InMemoryAccountsRepository()

        sut = new GetAccountInfoUseCase(
            accountsRepository
        )
    })

    it('should be able to get account info', async () => {
        await accountsRepository.create(
            makeAccount({
                holderId: new UniqueEntityID('member-1'),
                balance: 100
            },
                new UniqueEntityID('account-1')
            )
        )

        const result = await sut.execute({
            memberId: 'member-1'
        })

        expect(result.isRight()).toBe(true)
        expect(result.value).toMatchObject({
            balance: 100,
            createdAt: expect.any(Date),
            updatedAt: null
        })
    })
})
