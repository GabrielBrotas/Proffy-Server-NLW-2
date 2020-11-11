import express from 'express';
import db from './database/connection';

const routes = express.Router();

routes.post('/classes', async (req, res) => {
    const {name, avatar, whatsapp, bio, subject, cost, schedule} = req.body
    
    // inserir usuario na table users, vai retornar o id gerado dos usuarios inseridos na tabela, como só é possivel inserir um usuario por vez vai retornar o id dele em um array
    // caso quisesse inserir mais de um usuario ao mesmo tempo era só usar um array no insert([{...},{...},...])
    const insertedUsersId = await db('users').insert({
        name, 
        avatar,
        whatsapp,
        bio
    })

    // pegar o id do usuario que está no array
    const user_id = insertedUsersId[0]
    
    await db('classes').insert({
        subject,
        cost,
        user_id
    })

    return res.send()

})

export default routes