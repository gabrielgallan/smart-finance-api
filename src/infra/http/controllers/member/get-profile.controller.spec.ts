import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Hasher } from '@/domain/finances/application/cryptography/hasher'
import { Encrypter } from '@/domain/finances/application/cryptography/encrypter'

describe('Get member profile tests', () => {
  let app: INestApplication
  let prisma: PrismaService
  let hasher: Hasher
  let encrypter: Encrypter

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    hasher = moduleRef.get(Hasher)

    encrypter = moduleRef.get(Encrypter)

    await app.init()
  })

  it('[GET] /api/profile', async () => {
    const member = await prisma.member.create({
        data: {
            name: 'gabriel',
            email: 'gabriel@email.com',
            passwordHash: await hasher.generate('gabriel123')
        }
    })

    const token = await encrypter.encrypt({ sub: member.id })

    const response = await request(app.getHttpServer())
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      
      expect(response.body).toMatchObject({
        member: {
            name: 'gabriel',
            email: 'gabriel@email.com'
        }
      })
  })

  afterAll(async () => {
    await app.close()
  })
})
