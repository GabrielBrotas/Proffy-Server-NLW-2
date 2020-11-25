// O nome tem 00 na frente porque os arquivos são executados em forma de sequencia, se não numerar a sequencia pode ser que um seja criado primeiro sendo que faz dependencia com outro que nao foi criado ainda.

import Knex from 'knex';

// Knex com nome maiúsculo para que o minúsculo entenda que é um arquivo de conexão com o banco
// O knex já conhece as funções up e down, ele vai vim para este arquivo buscando por elas

// O up diz quais alterações quer fazendo no banco de dados, arquivos que vão ser adicionados, etc
export async function up(knex: Knex) {
    // criar table users
    return knex.schema.createTable('users', table => {
        table.increments('id').primary(); // campo id com autoincrement e primario;
        table.string('name').notNullable();
        table.string('email').notNullable();
        table.string('password').notNullable();
        table.string('avatar').notNullable();
    })
}

// o down é para quando acontece algo errado o que fazer para voltar
export async function down(knex: Knex) {
    return knex.schema.dropTable('users')
}