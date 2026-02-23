import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Encrypter } from '@/domain/finances/application/cryptography/encrypter'

describe('Categories tests', () => {
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

    it('[POST] /api/categories', async () => {
        const account = await prisma.account.create({
            data: {
                holder: {
                    create: {
                        email: 'johndoe@email.com',
                    }
                }            
            }
        })

        const token = await encrypter.encrypt({ sub: account.holderId })

        return await request(app.getHttpServer())
            .post('/api/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Sports',
                description: 'sport expenses'
            })
            .expect(201)
    })

    it('[GET] /api/categories', async () => {
        const account = await prisma.account.create({
            data: {
                holder: {
                    create: {
                        email: 'johndoe2@email.com',
                    }
                },
                categories: {
                    createMany: {
                        data: [
                            {
                                name: 'Uber',
                                slug: 'uber'
                            },
                            {
                                name: 'iFood',
                                slug: 'ifood'
                            },
                        ]
                    }
                }
            }
        })

        const token = await encrypter.encrypt({ sub: account.holderId })

        const response = await request(app.getHttpServer())
            .get('/api/categories')
            .set('Authorization', `Bearer ${token}`)
            .send()
            .expect(200)
        
        expect(response.body.categories).toHaveLength(2)
    })

    it('[PUT] /api/categories/:slug', async () => {
        const account = await prisma.account.create({
            data: {
                holder: {
                    create: {
                        email: 'johndoe3@email.com',
                    }
                },
                categories: {
                    createMany: {
                        data: [
                            {
                                name: 'Uber',
                                slug: 'uber'
                            }
                        ]
                    }
                }
            }
        })

        const token = await encrypter.encrypt({ sub: account.holderId })

        return await request(app.getHttpServer())
            .put('/api/categories/uber')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Transport'
            })
            .expect(204)
    })

    afterAll(async () => {
        await app.close()
    })
})
