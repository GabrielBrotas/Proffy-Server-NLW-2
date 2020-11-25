import express from 'express';
import cors from 'cors'
import session from 'express-session'
import passport from 'passport'

import routes from './routes';

import authFunction from './configs/auth';

const app = express();
const auth = authFunction();

// configs
app.use(session({
    secret: "RandomTextForSecurity",
    cookie: {
        maxAge: 3000000000000
    },
    resave: true,
    saveUninitialized: false
}))

app.use(auth.initialize())
app.use(passport.session())

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

app.use(cors())
app.use(express.json());
app.use(routes);

app.listen(8080, () => {
    console.log('server running in port 8080')
})