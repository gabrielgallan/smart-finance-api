import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Encrypter } from '@/domain/identity/application/cryptography/encrypter'

describe('Upload user avatar tests', () => {
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

  it('[POST] /api/profile/avatar', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'johndoe@email.com',
      }
    })

    const token = await encrypter.encrypt({ sub: user.id })

    const response = await request(app.getHttpServer())
      .post('/api/profile/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', './test/e2e/sample-upload.jpg')
      .expect(201)
  })

  afterAll(async () => {
    await app.close()
  })
})
