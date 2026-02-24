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
        const user = await prisma.user.create({
            data: {
                email: 'johndoe@email.com',
                passwordHash: 'johnDoe123',
                tokens: {
                    create: {
                        id: 'valid-token',
                        type: 'PASSWORD_RECOVER',
                        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 1)
                    }
                }
            }
        })

        await request(app.getHttpServer())
            .put('/api/profile/password')
            .send({
                code: 'valid-token',
                password: 'newPassword123'
            })
            .expect(204)

        const updatedUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        expect(updatedUser?.passwordHash).not.toBe('johnDoe123')
    })

    afterAll(async () => {
        await app.close()
    })
})