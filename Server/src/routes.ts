import express from 'express';
import ClassesController from './controllers/ClassesController';
import ConnectionsController from './controllers/ConnectionsController';

const routes = express.Router();
const classesControllers = new ClassesController();
const connectionsController = new ConnectionsController();

// classesControllers.create para usar o atributo create da classe
routes.post('/users', classesControllers.createNewUser);
routes.post('/login', classesControllers.loginUser);
routes.post('/classes', classesControllers.create)
routes.get('/classes', classesControllers.index)

routes.post('/connections', connectionsController.create)
routes.get('/connections', connectionsController.index)


export default routes