import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { hash } from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'

describe('Open member account tests', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  it('[POST] /api/accounts', async () => {
    const user = await prisma.user.create({
        data: {
            name: 'gabriel',
            email: 'gabriel@email.com',
            password: await hash('gabriel123', 8)
        }
    })

    const token = jwt.sign({ sub: user.id })

    return await request(app.getHttpServer())
      .post('/api/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        initialBalance: 400
      })
      .expect(201)
      .expect({})
  })

  afterAll(async () => {
    await app.close()
  })
})
