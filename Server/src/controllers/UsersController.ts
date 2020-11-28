import { Request, Response } from "express";
import db from '../database/connection'
import bcrypt from 'bcryptjs'
import jwt from 'jwt-simple'
import jwtConfig from "../configs/jwt-config";
import { userDataProps, validateRegisterUser } from "../utils/validator";
import isEmpty from "../utils/ObjectIsEmpty";

export default class UsersController {

    async createNewUser(req: Request, res: Response) {
        const {name, email, password, confirmPassword, avatar} = req.body
    

        const userInfo = {name, email, password, confirmPassword, avatar};

        let errors: userDataProps = validateRegisterUser(userInfo)

        try {
    
            const usersDB = await db('users')

            usersDB.forEach( user => {
                if(user.email === email) {
                    errors.email = "Email already exists"
                }
                if(user.name === name) {
                    errors.name= "Name already exists"
                }
            })

            if(password !== confirmPassword) {
                errors.password = "Password does not match"
            }

            if(!isEmpty(errors)) {
                return res.status(400).send(errors)
            } else {
                var salt = bcrypt.genSaltSync(10)
                var hash = bcrypt.hashSync(password, salt)

                const userId = await db('users').insert({name, email, password: hash, avatar})
                
                const payload = {user: {
                    userId: userId[0],
                    name,
                    avatar, 
                    email
                }}
                const token = jwt.encode(payload, jwtConfig.jwtSecret)
                return res.status(200).json({token})
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
                        return res.status(200).json({token})
                    } else {
                        return res.status(400).send({password: "Invalid Password"})
                    }
                })
            } else {
                return res.status(400).send({email: "User not found"})
            }

        } else {
            return res.status(400).send({error: "Something went wrong"})
        }
    }
}