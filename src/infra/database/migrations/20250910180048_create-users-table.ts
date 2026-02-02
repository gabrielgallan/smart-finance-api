import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('users', (table) => {
        table.uuid('id').primary().notNullable()
        table.text('name').notNullable()
        table.integer('age').notNullable()
        table.text('cpf').notNullable().unique()
        table.text('email').notNullable().unique()
        table.text('password').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('users')
}

