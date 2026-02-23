import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Encrypter } from '@/domain/finances/application/cryptography/encrypter'
import { Account } from '@prisma/client'
import { UUIDGenerator } from 'test/e2e/factories/uuid-generator'

describe('List transaction tests', () => {
    let app: INestApplication
    let prisma: PrismaService
    let encrypter: Encrypter

    let account: Account
    let token: string
    
    const uuids = UUIDGenerator(2)

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
                        name: 'gabriel',
                        email: 'gabriel@email.com',
                        passwordHash: 'gab123'
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
                                connect: { id: uuids[1] }
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

    it('[GET] /api/transactions?categoryId={uuid}', async () => {
        vi.setSystemTime(new Date(2025, 0, 30))

        const response = await request(app.getHttpServer())
            .get('/api/transactions')
            .set('Authorization', `Bearer ${token}`)
            .query({
                categoryId: uuids[0]
            })
            .expect(200)

        expect(response.body.transactions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    title: expect.any(String),
                    amount: expect.any(Number),
                    category: expect.objectContaining({
                        slug: 'investments'
                    })
                })
            ])
        )
    })

    it('[GET] /api/transactions?page=1&limit=10', async () => {
        vi.setSystemTime(new Date(2025, 0, 30))

        const response = await request(app.getHttpServer())
            .get('/api/transactions')
            .set('Authorization', `Bearer ${token}`)
            .query({
                page: 1,
                limit: 10
            })
            .expect(200)

        expect(response.body.transactions).toHaveLength(5)
    })

    it('[GET] /api/transactions?start=2025-01-01&end=2025-01-15', async () => {
        vi.setSystemTime(new Date(2025, 0, 30))

        const response = await request(app.getHttpServer())
            .get('/api/transactions')
            .set('Authorization', `Bearer ${token}`)
            .query({
                start: '2025-01-01',
                end: '2025-01-15'
            })
            .expect(200)

        expect(response.body.transactions).toHaveLength(2)
    })

    afterAll(async () => {
        await app.close()
    })
})
