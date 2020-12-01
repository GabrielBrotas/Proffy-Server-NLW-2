import express from 'express';
import UsersController from './controllers/UsersController'
import ClassesController from './controllers/ClassesController';
import ConnectionsController from './controllers/ConnectionsController';

const routes = express.Router();
const usersControllers = new UsersController();
const classesControllers = new ClassesController();
const connectionsController = new ConnectionsController();

routes.post('/user', usersControllers.createNewUser);
routes.post('/checkUser', usersControllers.checkIfNameAndEmailExists)
routes.post('/login', usersControllers.loginUser);
routes.post('/classes', classesControllers.create);
routes.get('/classes', classesControllers.index);

routes.post('/connections', connectionsController.create)
routes.get('/connections', connectionsController.index)

export default routes