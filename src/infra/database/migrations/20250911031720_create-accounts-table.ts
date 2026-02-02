import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('accounts', (table) => {
        table.uuid('id').primary().notNullable()
        table.uuid('user_id').notNullable()
        table.text('holder').notNullable()
        table.decimal('balance', 10, 2).notNullable()
        table.text('type').defaultTo('Corrente')
        table.text('transaction_password').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('accounts')
}

