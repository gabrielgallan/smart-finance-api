import knex from 'knex'
import type { Knex } from 'knex'
import env from './src/infra/env/config.ts'

const client = env.NODE_ENV === 'development' ? 'sqlite' : 'pg'

const connection = env.NODE_ENV === 'development' ? {
    filename: env.DATABASE_URL
} : env.DATABASE_URL

export const config: Knex.Config = {
    client,
    connection,
    useNullAsDefault: true,
    migrations: {
        extension: "ts",
        directory: "./database/migrations"
    }
}

const db = knex(config)

export default db