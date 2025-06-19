import express, { Express } from 'express';

const router = express.Router();


const apiRoutes = (app: Express) => {


    // router.post('/register', postRegister);

    app.use('/api/', router);
};

export default apiRoutes;