import express from 'express';
import routes from './routes';

const app = express();

// * Tipos de Rotas HTTP
/*
    GET: buscar ou listar informação
    POST: criar nova informação
    Put: atualizar informação existente
     Delete: deletar informação existente
*/
/*
    Corpo (Request Body): Dados para criação ou atualização de um registro
    Route Params: Identificar qual recurso eu quero atualizar ou deletar
    Query Params: Paginação, filtros, ordenação
*/

app.use(express.json());
app.use(routes);


app.listen(8080, () => {
    console.log('server running in port 8080')
})