import 'dotenv/config'
import z from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  const errors = _env.error.format()
  console.error('Invalid enviroment variable!', errors)

  process.exit(1)
}

const env = _env.data

export default env
