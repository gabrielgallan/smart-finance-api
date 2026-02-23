import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Encrypter } from '@/domain/finances/application/cryptography/encrypter'
import { Account } from '@prisma/client'

describe('Create transaction tests', () => {
    let app: INestApplication
    let prisma: PrismaService
    let encrypter: Encrypter

    let account: Account
    let token: string

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
                }
            }
        })

        token = await encrypter.encrypt({ sub: account.holderId })

        await app.init()
    })

    it('[POST] /api/transactions', async () => {
        return await request(app.getHttpServer())
            .post('/api/transactions')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Month Salary',
                amount: 1800,
                operation: 'income',
            })
            .expect(201)
    })

    afterAll(async () => {
        await app.close()
    })
})
