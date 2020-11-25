import { Request, Response} from 'express'
import jwt from 'jwt-simple'
import jwtConfig from '../configs/jwt-config'
import bcrypt from 'bcryptjs'
import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';


// Definir o formato deste objeto pra nao mostrar o erro de 'any' quando for criar a classesSchedule
interface ScheduleItem {
    week_day: number,
    from: string,
    to: string
}

interface UserProps {
    id: number;
    name: string;
    email: string;
    avatar: string;
}

export default class ClassesController {

    // Métodos da classe

    // index retorna uma lista
    async index(req: Request, res: Response) {
        const filters = req.query;

        const subject = filters.subject as string;
        const week_day = filters.week_day as string;
        const time = filters.time as string;
        let timeInMinutes:number;

        let classesFormated: Array<Object> = [];
        let classSchedule: Array<Object> = [];
        let teacherData: Object;

        // informar para o typescript que o time vai vim como string
        if(time) { timeInMinutes = convertHourToMinutes(time) }

        try { 
            var classes = await db('classes')
            .whereExists( function() {
                if( timeInMinutes) {
                    this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                    .whereRaw('`class_schedule`.`from` <= ??', [Number(timeInMinutes)])
                    .whereRaw('`class_schedule`.`to` > ??', [Number(timeInMinutes)])
                } else {
                    this.select('class_schedule.*').from('class_schedule')
                }
            })
            .whereExists( function() {
                if(week_day) {
                    this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
                } else {
                    this.select('class_schedule.*').from('class_schedule')
                }
            })
            .where( function() {
                if(subject) {
                    this.where('classes.subject', '=', subject)
                }
            })
            .join('users', 'classes.user_id', '=', 'users.id')
            .select(['classes.*', 'users.*' ])
            .join('class_schedule', 'classes.id', '=', 'class_schedule.class_id')
            .select(['class_schedule.*' ])          
            
            classes.forEach( (classData, index) => {
                
                const {id, name, subject, bio, avatar, whatsapp, cost, user_id, week_day, from, to } = classData

                teacherData = {id, name, subject, bio, avatar, whatsapp, cost, user_id}

                // se for o ultimo dado
                if((classes.length - 1) === index) {
                    classSchedule.push({week_day, from, to})
                    classesFormated.push({...teacherData, classSchedule})  
                } else {
                    if(classData.class_id === classes[index + 1].class_id) {
                        classSchedule.push({week_day, from ,to})
                    } else {
                        classSchedule.push({week_day, from ,to})
                        classesFormated.push({...teacherData, classSchedule})
                        classSchedule = [];
                    }
                }
            })
            return res.json(classesFormated)
        } catch(err) {
            return res.json(err)
        }        
    }

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
                        const payload = {id: user.id}
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
    
    // como o typescript nao reconhece req e res a gnt tem que importar o modulo do express e definir os parametros como sendo eles
    async create(req: Request, res: Response)  {
        const {name, avatar, whatsapp, bio, subject, cost, schedule} = req.body
    
        // Normalmente o codigo vai adicionar o users, criar a classe e depois criar o schedule, mas, caso ocorra erro na criação do schedule os outros dados já terão sido criados, então, vamos usar o db.transactions para armazenar todos os dados e no final da um commit geral para criar tudo de vez, caso de erro nenhum dos bancos será adicionado
        const trx = await db.transaction();

        try {
            // inserir usuario na table users, vai retornar o id gerado dos usuarios inseridos na tabela, como só é possivel inserir um usuario por vez vai retornar o id dele em um array
            // caso quisesse inserir mais de um usuario ao mesmo tempo era só usar um array no insert([{...},{...},...])
            // o trx ta substituindo o db('users') para guardar os dados na transaction e executar todas as alterações ao mesmo tempo   
            const insertedUsersId = await trx('users').insert({
                name, 
                avatar,
                whatsapp,
                bio
            })

            // pegar o id do usuario que está no array
            const user_id = insertedUsersId[0]
            
            const insertedClassesId = await trx('classes').insert({
                subject,
                cost,
                user_id
            })

            const class_id = insertedClassesId[0]

            // transformar os schedules em um novo objeto convertendo as horas para minutos
            const classSchedule = schedule.map( (scheduleItem: ScheduleItem) => {
                return {
                    class_id,
                    week_day: scheduleItem.week_day,
                    from: convertHourToMinutes(scheduleItem.from),
                    to: convertHourToMinutes(scheduleItem.to)  
                }
            })

            // Colocar todos os dias da semana no schedule
            for (let i = 0; i <= 6; i++) {
                let scheduleHasWeekDay = false;
                if(classSchedule[i] === undefined || classSchedule[i].week_day !== i) {
                    classSchedule.forEach( (schedule: ScheduleItem) => {
                        if(schedule.week_day === i) {
                            scheduleHasWeekDay = true;
                        }
                    })
                if(!scheduleHasWeekDay) {
                    classSchedule.splice(i, 0, {
                        class_id: classSchedule[0].class_id,
                        week_day: i,
                        from: 0,
                        to: 0,
                    })
                }
                }
            }

            await trx('class_schedule').insert(classSchedule)

            // commit em todos os dados
            await trx.commit()

            return res.status(201).send();

        } catch (err) {
            // Caso dê erro na criação dos dados ele vai desfazer todas as transctions anteriores
            await trx.rollback();
            console.log(err)
            return res.status(400).json({error: 'Unexpected error while creating new class'})
        }
    }
}
