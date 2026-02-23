import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('Reset password tests', () => {
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

    it('[PUT] /api/profile/password', async () => {
        const member = await prisma.member.create({
            data: {
                email: 'gabriel@email.com',
                passwordHash: 'gab123',
                tokens: {
                    create: {
                        id: 'valid-token',
                        type: 'PASSWORD_RECOVER'
                    }
                }
            }
        })

        await request(app.getHttpServer())
            .put('/api/profile/password')
            .send({
                code: 'valid-token',
                password: 'newpassword123'
            })
            .expect(204)

        const updatedMember = await prisma.member.findUnique({
            where: { id: member.id }
        })

        expect(updatedMember?.passwordHash).not.toBe('gab123')
    })

    afterAll(async () => {
        await app.close()
    })
})