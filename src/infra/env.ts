import 'dotenv/config'
import z from 'zod'

export const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(8000),
    DATABASE_URL: z.string(),
    JWT_PRIVATE_KEY: z.string(),
    JWT_PUBLIC_KEY: z.string()
})

export type Env = z.infer<typeof envSchema>