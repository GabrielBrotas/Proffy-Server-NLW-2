import express from 'express';
import db from './database/connection';

const routes = express.Router();

routes.post('/classes', async (req, res) => {
    const {name, avatar, whatsapp, bio, subject, cost, schedule} = req.body
    
    // inserir usuarios na table uosers
    await db('users').insert({
        name, 
        avatar,
        whatsapp,
        bio
    })

    return res.send()

})

export default routes