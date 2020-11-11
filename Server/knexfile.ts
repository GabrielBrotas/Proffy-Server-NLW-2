import path from 'path'

module.exports = {
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'src', 'database', 'database.sqlite')
        // dentro do caminho até a pasta atual (__dirname), vai acessar a pasta src/database e procuraro arquivo 'database.sqlite' para se conectar
    },
    // migrations - controla a versão do banco de dados;
    migrations: {
        directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    },
    useNullAsDefault: true
}