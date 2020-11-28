import { Request, Response} from 'express'
import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';

// Definir o formato deste objeto pra nao mostrar o erro de 'any' quando for criar a classesSchedule
interface ScheduleItem {
    week_day: number,
    from: string,
    to: string
}

interface ClassFormat {
    id: number;
    subject: string;
    cost: number;
    whatsapp: string;
    bio: string;
    user_id: number;
    name: string;
    email: string;
    avatar: any;
    schedule: any;
    class_id: number;
}

export default class ClassesController {

    // index retorna uma lista
    async index(req: Request, res: Response) {
        const filters = req.query;

        const subject = filters.subject as string;
        const week_day = filters.week_day as string;
        const time = filters.time as string;
        let timeInMinutes:number;   

        let formatedClassSchedule: Array<ClassFormat> = []
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
            .orderBy('class_id')

            classes.forEach( Class => {
                const {id, user_id, subject, cost, whatsapp, bio, name, email, avatar, class_id} = Class
                formatedClassSchedule[Class.class_id] = {id, class_id, user_id, subject, cost, whatsapp, bio, name,  email, avatar, schedule: []}
            })

            classes.forEach( Class => {
                const {week_day, from, to} = Class
                formatedClassSchedule[Class.class_id].schedule.push({week_day, from, to});
            })

            formatedClassSchedule = formatedClassSchedule.filter( nullClass => nullClass !== null)
    
            return res.json(formatedClassSchedule)
        } catch(err) {
            console.log(err)
            return res.json(err)
        }        
    }

    // como o typescript nao reconhece req e res a gnt tem que importar o modulo do express e definir os parametros como sendo eles
    async create(req: Request, res: Response)  {
        const {user_id, subject, cost, whatsapp, bio, schedule} = req.body
    
        // Normalmente o codigo vai adicionar o users, criar a classe e depois criar o schedule, mas, caso ocorra erro na criação do schedule os outros dados já terão sido criados, então, vamos usar o db.transactions para armazenar todos os dados e no final da um commit geral para criar tudo de vez, caso de erro nenhum dos bancos será adicionado
        const trx = await db.transaction();

        try {
            const insertedClassesId = await trx('classes').insert({
                user_id,
                subject,
                cost,
                whatsapp,
                bio,
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

            await trx('class_schedule').insert(classSchedule);

            // commit em todos os dados
            await trx.commit();

            return res.status(201).send();

        } catch (err) {
            // Caso dê erro na criação dos dados ele vai desfazer todas as transctions anteriores
            await trx.rollback();
            return res.status(400).json({error: 'Unexpected error while creating new class'});
        }
    }
}
