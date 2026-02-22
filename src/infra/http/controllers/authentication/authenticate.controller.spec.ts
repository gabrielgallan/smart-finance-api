import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher'

describe('Authenticate member tests', () => {
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

  it('[POST] /api/sessions', async () => {
    await prisma.member.create({
        data: {
            name: 'Gabriel',
            email: 'gabriel@email.com',
            passwordHash: await new BcryptHasher().generate('gabriel123')
        }
    })

    const response = await request(app.getHttpServer())
      .post('/api/sessions')
      .send({
        email: 'gabriel@email.com',
        password: 'gabriel123'
      })
      .expect(201)
      
      expect(response.body).toMatchObject({
        token: expect.any(String)
      })
  })

  afterAll(async () => {
    await app.close()
  })
})
