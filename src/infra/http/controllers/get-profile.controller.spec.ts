import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { hash } from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'

describe('Get member profile tests', () => {
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

  it('[GET] /api/profile', async () => {
    const user = await prisma.user.create({
        data: {
            name: 'gabriel',
            email: 'gabriel@email.com',
            password: await hash('gabriel123', 8)
        }
    })

    const token = jwt.sign({ sub: user.id })

    const response = await request(app.getHttpServer())
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      
      expect(response.body).toMatchObject({
        profile: {
            name: 'gabriel',
            email: 'gabriel@email.com'
        }
      })
  })

  afterAll(async () => {
    await app.close()
  })
})
