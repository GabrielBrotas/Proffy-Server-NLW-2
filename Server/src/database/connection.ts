import knex from 'knex' // fazer conexão com o banco
import path from 'path'

const db = knex({ 
    client: 'sqlite3', // definir o sql que vai ser utilizado
    connection: { 
        filename: path.resolve(__dirname, 'database.sqlite')
        // path.resolve vai unir os caminhos. __dirname é o caminho para o diretorio atual C:\Users..., 'database.sqlite' é o arquivo que vai ser procurado na pasta do projeto
    },
    useNullAsDefault: true, // Para os campos que não forem preenchidos
});

export default db;
 