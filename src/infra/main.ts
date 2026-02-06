import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { Env } from './env'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: false
  })

  const config: ConfigService<Env, true> = app.get(ConfigService)
  const port = config.get('PORT', { infer: true })

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