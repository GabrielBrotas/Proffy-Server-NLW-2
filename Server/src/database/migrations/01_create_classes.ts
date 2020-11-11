import Knex from 'knex';

export async function up(knex: Knex) {
    // criar table classes
    return knex.schema.createTable('classes', table => {
        table.increments('id').primary();
        table.string('subject').notNullable();
        table.decimal('cost').notNullable();
        
        // relacionamento de tabelas com quem vai ser o ministrante da aula
        table.integer('user_id')
            .notNullable() // nao nulo
            .references('id') // referencia o id 
            .inTable('users') // da table users, criando uma foreignKey
            .onUpdate('CASCADE') // caso o id do professor tenha sido alterado vai alterar em todas as suas aulas, pois precisa manter a relação 
            .onDelete('CASCADE'); // onDelete = se o userId sumir, ou seja, o professor seja deletado do banco de dados vai criado o efeito 'CASCADE' ou cascada, vai deletar todas as aulas dele junto
    })
}

// o down é para quando acontece algo errado o que fazer para voltar
export async function down(knex: Knex) {
    return knex.schema.dropTable('classes')
}