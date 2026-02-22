import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Encrypter } from '@/domain/finances/application/cryptography/encrypter'
import { Hasher } from '@/domain/finances/application/cryptography/hasher'

describe('Open member account tests', () => {
  let app: INestApplication
  let prisma: PrismaService
  let encrypter: Encrypter
  let hasher: Hasher

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    encrypter = moduleRef.get(Encrypter)

    hasher = moduleRef.get(Hasher)

    await app.init()
  })

  it('[POST] /api/accounts', async () => {
    const member = await prisma.member.create({
        data: {
            name: 'gabriel',
            email: 'gabriel@email.com',
            passwordHash: await hasher.generate('gabriel123')
        }
    })

    const token = await encrypter.encrypt({ sub: member.id })

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
