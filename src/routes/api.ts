import express, { Express } from 'express';
import { postRegister, postVerify, postLogin } from '../controllers/user/auth.controller';
import { checkValidJwt } from '../middleware/jwt.middleware';

const router = express.Router();


const apiRoutes = (app: Express) => {
    router.post('/register', postRegister);

    router.post('/verify', postVerify)

    router.post('/login', postLogin)

    app.use('/', checkValidJwt, router);
};

export default apiRoutes;