import env from '../env/config.ts'
import app from './app'

import logger from '../logger/index.ts'

app.listen(
  {
    port: env.PORT,
    host: '0.0.0.0',
  },
  (err, address) => {
    if (err) {
      logger.error('Error starting HTTP server', err)
      process.exit(1)
    }

    logger.info(`HTTP server running on ${address}`)
  },
)
