import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'

describe('Register new member tests', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  it('[POST] /api/members', async () => {
    return request(app.getHttpServer())
      .post('/api/members')
      .send({
        name: 'John Doe',
        email: 'johndoe@email.com',
        password: 'johnDoe123'
      })
      .expect(201)
      .expect({})
  })

  afterAll(async () => {
    await app.close()
  })
})
