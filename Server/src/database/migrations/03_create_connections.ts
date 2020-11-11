import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('connections', table => {
        table.increments('id').primary();

        // houve uma conexao com qual professor?
        table.integer('user_id')
            .notNullable() 
            .references('id')  
            .inTable('users') 
            .onUpdate('CASCADE') 
            .onDelete('CASCADE'); 

        // quando que houve a conexao?
        table.timestamp('created_at')
            .defaultTo('now()')
            .notNullable();
    })
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('connections')
}