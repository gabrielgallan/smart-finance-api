import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Encrypter } from '@/domain/finances/application/cryptography/encrypter'

describe('Edit profile tests', () => {
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

    it('[PUT] /api/profile', async () => {
        const member = await prisma.member.create({
            data: {
                name: 'gabriel',
                email: 'gabriel@email.com',
                passwordHash: 'gab123'
            }
        })

        const token = await encrypter.encrypt({ sub: member.id })

        await request(app.getHttpServer())
            .put('/api/profile')
            .set('Authorization', `Bearer ${token}`)
            .send({
                email: 'other@email.com',
            })
            .expect(204)

        const updatedMember = await prisma.member.findUnique({
            where: { id: member.id }
        })

        expect(updatedMember?.email).toBe('other@email.com')
    })

    afterAll(async () => {
        await app.close()
    })
})
