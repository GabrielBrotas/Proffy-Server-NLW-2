import { Request, Response} from 'express'

import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';

// Definir o formato deste objeto pra nao mostrar o erro de 'any' quando for criar a classesSchedule
interface ScheduleItem {
    week_day: number,
    from: string,
    to: string
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
        
        // Caso o usuario nao informe nenhum dos campos..., essa rota só funciona se tiver algum parametro
        // if(!filters.week_day || !filters.subject || !filters.time) {
        //     return res.status(400).json({
        //         error: "Missing filters to search classes"
        //     })
        // }

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
            .select(['classes.*', 'users.*'])

            return res.json(classes)
        } catch(err) {
            console.log(err)
            return res.json(err)
        }
        
    }

    // como o typescrip nao reconhece req e res a gnt tem que importar o modulo do express e definir os parametros como sendo eles
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

            await trx('class_schedule').insert(classSchedule)

            // commit em todos os dados
            await trx.commit()

            return res.status(201).send();

        } catch (err) {
            // Caso dê erro na criação dos dados ele vai desfazer todas as transctions anteriores
            await trx.rollback();

            return res.status(400).json({error: 'Unexpected error while creating new class'})
        }
    }
}
