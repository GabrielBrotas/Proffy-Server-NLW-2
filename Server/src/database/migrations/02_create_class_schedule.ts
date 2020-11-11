import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('class_schedule', table => {
        table.increments('id').primary();
        table.integer('week_day').notNullable(); // de 0 a 6, domingo a sabado
        table.integer('from').notNullable(); // de qual horario
        table.integer('to').notNullable(); // ate qual
    
        // relacionamento com as classes/aulas
        table.integer('class_id')
            .notNullable() 
            .references('id')  
            .inTable('classes') 
            .onUpdate('CASCADE') 
            .onDelete('CASCADE'); 
    })
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('class_schedule')
}