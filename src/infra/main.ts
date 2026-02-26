import { NestFactory } from '@nestjs/core'
import { AppModule } from '@/infra/app.module'
import { EnvService } from './env/env.service'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: false
  })

  const config = new DocumentBuilder()
    .setTitle('Smart Finance API')
    .setDescription('Finance manager API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('docs', app, document)

  const envService = app.get(EnvService)
  const port = envService.get('PORT')

  app.listen(port)
    .catch((err) => {
      console.error('Error running HTTP server', err)
      process.exit(1)
    })
    .finally(() => {
      console.log(`Server HTTP running on port ${port}`)
    })
}

bootstrap()