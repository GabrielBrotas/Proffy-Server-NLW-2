import { Request, Response } from "express";
import db from '../database/connection'
import bcrypt from 'bcryptjs'
import jwt from 'jwt-simple'
import jwtConfig from "../configs/jwt-config";

export default class UsersController {

    async createNewUser(req: Request, res: Response) {
        const {name, email, password, confirmPassword, avatar} = req.body
    
        let errors: Array<Object> = [];

        try {
            const usersDB = await db('users')

            usersDB.forEach( user => {
                if(user.email === email) {
                    errors.push({email: 'Email already exists'})
                }
                if(user.name === name) {
                    errors.push({name: 'Name already exists'})
                }
            })

            if(password !== confirmPassword) {
                errors.push({password: 'Password does not match'})
            }

            if(errors.length > 0) {
                return res.status(400).send({errors})
            } else {
                var salt = bcrypt.genSaltSync(10)
                var hash = bcrypt.hashSync(password, salt)

                await db('users').insert({name, email, password: hash, avatar})
                return res.status(202).send({message: "user created with success"})
            }
            
        } catch(err) {
            return res.status(400).send({error: "something went wrong"})
        }
    }

    async loginUser(req: Request, res: Response) {
        const {email, password} = req.body

        if(email && password) {
            const users = await db('users').where('email', email)
            const user = users[0]
    
            if(user) {
                bcrypt.compare(password, user.password, (err, match) => {
                    if(match) {
                        const payload = {user: {
                            userId: user.id,
                            name: user.name,
                            avatar: user.avatar, 
                            email: user.email,
                        }}
                        const token = jwt.encode(payload, jwtConfig.jwtSecret)
                        res.status(200).json({token})
                    } else {
                        res.status(404).json({error: "Invalid Password"})
                    }
                })
            } else {
                res.status(404).json({error: "User not found"})
            }

        } else {
            res.status(404).json({error: "Something went wrong"})
        }
    }
}