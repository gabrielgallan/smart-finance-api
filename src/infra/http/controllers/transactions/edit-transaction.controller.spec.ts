import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Encrypter } from '@/domain/finances/application/cryptography/encrypter'
import { Account } from '@prisma/client'
import { UUIDGenerator } from 'test/e2e/factories/uuid-generator'

describe('Edit transaction tests', () => {
    let app: INestApplication
    let prisma: PrismaService
    let encrypter: Encrypter

    let account: Account
    let token: string
    
    const transactionsUUIDs = UUIDGenerator(1)
    const categoriesUUIDs = UUIDGenerator(2)

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleRef.createNestApplication()

        prisma = moduleRef.get(PrismaService)

        encrypter = moduleRef.get(Encrypter)

        account = await prisma.account.create({
            data: {
                holder: {
                    create: {
                        email: 'johndoe@email.com',
                    }
                },
                categories: {
                    create: [
                        {
                            id: categoriesUUIDs[0],
                            name: 'Investments',
                            slug: 'investments'
                        },
                        {
                            id: categoriesUUIDs[1],
                            name: 'Transport',
                            slug: 'transport'
                        }
                    ]
                },
                transactions: {
                    create: [
                        {
                            id: transactionsUUIDs[0],
                            categoryId: categoriesUUIDs[0],
                            title: 'Transaction 1',
                            amount: 1500,
                            operation: 'income',
                        }
                    ]
                }
            }
        })

        token = await encrypter.encrypt({ sub: account.holderId })

        await app.init()
    })

    it('[PUT] /api/transactions/{uuid}', async () => {
        await request(app.getHttpServer())
            .put(`/api/transactions/${transactionsUUIDs[0]}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                categoryId: categoriesUUIDs[1],
                title: 'New transaction name',
                description: 'my transaction description'
            })
            .expect(204)

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionsUUIDs[0] }
        })

        expect(transaction).toEqual(
            expect.objectContaining({
                categoryId: categoriesUUIDs[1],
                title: 'New transaction name',
                description: 'my transaction description'
            })
        )
    })

    afterAll(async () => {
        await app.close()
    })
})
