import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('Request password recover tests', () => {
    let app: INestApplication
    let prisma: PrismaService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleRef.createNestApplication()
        prisma = moduleRef.get(PrismaService)
        await app.init()
    })

    it('[POST] /api/password/recover', async () => {
        const member = await prisma.member.create({
            data: {
                email: 'johndoe@email.com',
            }
        })

        await request(app.getHttpServer())
            .post('/api/password/recover')
            .send({
                email: 'johndoe@email.com'
            })
            .expect(201)

        const recoverToken = await prisma.token.findFirst({
            where: { type: 'PASSWORD_RECOVER', memberId: member.id }
        })

        expect(recoverToken).toBeTruthy()
    })

    afterAll(async () => {
        await app.close()
    })
})