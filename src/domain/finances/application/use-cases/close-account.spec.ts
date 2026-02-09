import { IMembersRepository } from '../repositories/members-repository.ts'
import { InMemoryMembersRepository } from '@/../tests/repositories/in-memory-members-repository.ts'
import { ResourceNotFoundError } from './errors/resource-not-found-error.ts'
import { CloseAccountUseCase } from './close-account.ts'
import { IAccountsRepository } from '../repositories/accounts-repository.ts'
import { InMemoryAccountsRepository } from 'tests/repositories/in-memory-accounts-repository.ts'
import { makeMember } from 'tests/factories/make-member.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { ITransactionsRepository } from '../repositories/transactions-repository.ts'
import { ICategoriesRepository } from '../repositories/categories-repository.ts'
import { InMemoryCategoriesRepository } from 'tests/repositories/in-memory-category-repository.ts'
import { InMemoryTransactionsRepository } from 'tests/repositories/in-memory-transactions-repository.ts'
import { makeAccount } from 'tests/factories/make-account.ts'
import { makeCategory } from 'tests/factories/make-category.ts'
import { makeTransaction } from 'tests/factories/make-transaction.ts'

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
