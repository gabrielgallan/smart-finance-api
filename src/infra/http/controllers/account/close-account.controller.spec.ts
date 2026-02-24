import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Encrypter } from '@/domain/identity/application/cryptography/encrypter'

describe('Close member account tests', () => {
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

    it('[DELETE] /api/accounts', async () => {
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

        return await request(app.getHttpServer())
            .delete('/api/accounts')
            .set('Authorization', `Bearer ${token}`)
            .send()
            .expect(204)
    })

    afterAll(async () => {
        await app.close()
    })
})
