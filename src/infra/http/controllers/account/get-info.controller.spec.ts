import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Encrypter } from '@/domain/identity/application/cryptography/encrypter'

describe('Get member account info tests', () => {
    let app: INestApplication
    let prisma: PrismaService
    let encrypter: Encrypter

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleRef.createNestApplication()

        prisma = moduleRef.get(PrismaService)

        encrypter = moduleRef.get(Encrypter)

        await app.init()
    })

    it('[GET] /api/account', async () => {
        const account = await prisma.account.create({
            data: {
                holder: {
                    create: {
                        email: 'johndoel@email.com',
                    }
                }
            }
        })

        const token = await encrypter.encrypt({ sub: account.holderId })

        const response = await request(app.getHttpServer())
            .get('/api/account')
            .set('Authorization', `Bearer ${token}`)
            .send()
            .expect(200)

        expect(response.body).toMatchObject({
            balance: 0,
            createdAt: expect.any(String)
        })
    })

    afterAll(async () => {
        await app.close()
    })
})
