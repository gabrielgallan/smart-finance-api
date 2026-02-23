import { NestFactory } from '@nestjs/core'
import { AppModule } from '@/infra/app.module'
import { EnvService } from './env/env.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: false
  })

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