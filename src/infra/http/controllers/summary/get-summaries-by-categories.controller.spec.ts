import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Encrypter } from '@/domain/identity/application/cryptography/encrypter'
import { Account } from '@prisma/client'
import { UUIDGenerator } from 'test/e2e/factories/uuid-generator'

describe('Get account summaries by categories tests', () => {
    let app: INestApplication
    let prisma: PrismaService
    let encrypter: Encrypter

    let account: Account
    let token: string

    const uuids = UUIDGenerator(3)


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
                            id: uuids[0],
                            name: 'Investments',
                            slug: 'investments'
                        },
                        {
                            id: uuids[1],
                            name: 'Transport',
                            slug: 'transport'
                        },
                        {
                            id: uuids[2],
                            name: 'iFooed',
                            slug: 'ifood'
                        }
                    ]
                },
                transactions: {
                    create: [
                        {
                            title: 'Transaction 1',
                            amount: 1500,
                            operation: 'income',
                            category: {
                                connect: { id: uuids[0] }
                            },
                            createdAt: new Date(2025, 0, 5)
                        },
                        {
                            title: 'Transaction 2',
                            amount: 200,
                            operation: 'expense',
                            category: {
                                connect: { id: uuids[0] }
                            },
                            createdAt: new Date(2025, 0, 9)
                        },
                        {
                            title: 'Transaction 3',
                            amount: 2300,
                            operation: 'income',
                            category: {
                                connect: { id: uuids[1] }
                            },
                            createdAt: new Date(2025, 0, 17)
                        },
                        {
                            title: 'Transaction 4',
                            amount: 280.80,
                            operation: 'expense',
                            category: {
                                connect: { id: uuids[1] }
                            },
                            createdAt: new Date(2025, 0, 20)
                        },
                        {
                            title: 'Transaction 5',
                            amount: 15,
                            operation: 'income',
                            category: {
                                connect: { id: uuids[2] }
                            },
                            createdAt: new Date(2025, 0, 23)
                        }
                    ]
                }
            }
        })

        token = await encrypter.encrypt({ sub: account.holderId })

        await app.init()
    })

    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('[GET] /api/account/categories/summary?start={date}&end={date}', async () => {
        vi.setSystemTime(new Date(2025, 0, 30))

        const response = await request(app.getHttpServer())
            .get('/api/account/categories/summary')
            .set('Authorization', `Bearer ${token}`)
            .query({
                start: '2025-01-01',
                end: '2025-01-30',
            })
            .expect(200)

        expect(response.body.categories).toHaveLength(3)
    })

    afterAll(async () => {
        await app.close()
    })
})
