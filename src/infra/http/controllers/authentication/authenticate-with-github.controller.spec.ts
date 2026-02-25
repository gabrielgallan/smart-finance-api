import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { ExternalAuthProvider } from '@/domain/identity/application/auth/auth-provider'
import { GithubOAuthProviderMock } from 'test/e2e/mocks/github-oauth-provider-mock'

describe('Authenticate with Github tests', () => {
    let app: INestApplication

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
        .overrideProvider(ExternalAuthProvider)
        .useClass(GithubOAuthProviderMock)
        .compile()

        app = moduleRef.createNestApplication()

        await app.init()
    })

    it('[POST] /api/sessions/github', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/sessions/github')
            .send({
                code: 'fake-github-code'
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
