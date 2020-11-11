## Começo..
    >yarn init -y  // para começar o projeto com o package.json

    >yarn add typescript -D // instalar o typescript no ambiente de desenvolvimento

    >yarn tsc -init // para iniciar a configuração do typescript, e nesse arquivo que for instalado, 'tsconfig.json', vamos alterar a targer de 'es5' para 'es2017, para o typescript converter as funcionalidade ate o es2017, que é a versão de js que o node entende mais recente

    >yarn add ts-node-dev -D // vai verificar se tem uma alteração no script para atualizar sozinho, como se fosse o nodemon

    >yarn add knex sqlite3 // o knex traz funções para o manusear o sql, exemplo: ao inves de usar SELECT * FROM users -> knex('users').select('*)

## config
    em package.json, criar o script start para iniciar o projeto ts
        "scripts": {
            "start": "tsnd --transpile-only src/server.ts"
        }
        // --transpile-only é uma flag, essa flag vai converter o codigo ts para js e não vai verificar se tem erros, vai acelerar a execução da aplicação
        // --ignore-watch node_modules, para não tentar fazer conversão dentro da pasta node_modules pois os codigos são de terceiros, não nosso.
        // --respawn vai verificar a alteração no codigo, vai manter a execução, só vai parar se executar o comando ctrl+c para parar.
    >yarn start // Rodar o app
                
    Quando for instalar os pacotes, caso dê erro é porque o pacote pode ter sido feito com o ts ou não, os que não vem com o ts para conseguir entender nosso app a comunidade geralmente cria um type de terceiro para fazer funcionar, passando mouse por cima vai pedir para instalar o pacote que vai fazer funcionar.

    ex: yarn add @types/express -D // em modo desenvolvedor apenas

    script do knex
     adicionado nos scripts: 
     '"knex:migrate": "knex --knexfile knexfile.ts migrate:latest"'
     script para o knex entender ts, '--knexfile knexfile.ts' para procurar o arquivo de configuração que por padrao é .js

     caso queira adicionar mais funções do knex é só criar mais scripts,
     para buscar as funções precisa excutar no terminal o comando:
        >yarn knex
    vai aparecer as funcionalidades da biblioteca

## Funcinoalidades
    ### Conexoes
        -Rota para inicializar a quantidade de conexões;
        -Rota para criar uma nova conexão;

    ### Aulas
        -Rota para criar nova aula;
        -Rota para listar aulas;
        -Filtrar por materia, dia da semana e horário;
    
