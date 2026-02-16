import { IMembersRepository } from '../repositories/members-repository'
import { InMemoryMembersRepository } from 'test/repositories/in-memory-members-repository'
import { CloseAccountUseCase } from './close-account'
import { IAccountsRepository } from '../repositories/accounts-repository'
import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository'
import { makeMember } from 'test/factories/make-member'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ITransactionsRepository } from '../repositories/transactions-repository'
import { ICategoriesRepository } from '../repositories/categories-repository'
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-category-repository'
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions-repository'
import { makeAccount } from 'test/factories/make-account'
import { makeCategory } from 'test/factories/make-category'
import { makeTransaction } from 'test/factories/make-transaction'

let membersRepository: IMembersRepository
let accountRepository: IAccountsRepository
let transactionsRepository: ITransactionsRepository
let categoriesRepository: ICategoriesRepository
let sut: CloseAccountUseCase

describe('Close member account use case', () => {
    beforeEach(() => {
        membersRepository = new InMemoryMembersRepository()
        accountRepository = new InMemoryAccountsRepository()
        transactionsRepository = new InMemoryTransactionsRepository()
        categoriesRepository = new InMemoryCategoriesRepository()

        sut = new CloseAccountUseCase(
            membersRepository,
            accountRepository,
            transactionsRepository,
            categoriesRepository
        )
    })

    it('should be able to close a member account', async () => {
        await membersRepository.create(
            await makeMember({}, new UniqueEntityID('member-1')),
        )

        await accountRepository.create(
            makeAccount({
                holderId: new UniqueEntityID('member-1')
            }, new UniqueEntityID('account-1'))
        )

        await categoriesRepository.create(
            makeCategory({
                accountId: new UniqueEntityID('account-1'),
            },
            new UniqueEntityID('category-1'))
        )

        await Promise.all(
            Array.from({ length: 2 }, () =>
                transactionsRepository.create(
                    makeTransaction({
                        accountId: new UniqueEntityID('account-1'),
                        categoryId: new UniqueEntityID('category-1')
                    }),
                ),
            ),
        )

        const result = await sut.execute({
            memberId: 'member-1',
        })

        expect(result.isRight()).toBe(true)

        if (result.isRight()) {
            expect(result.value.rowsDeleted).toBe(4)
            expect(accountRepository.items).toHaveLength(0)
            expect(transactionsRepository.items).toHaveLength(0)
            expect(categoriesRepository.items).toHaveLength(0)
        }
    })
})
