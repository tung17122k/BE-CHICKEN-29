import express, { Express } from 'express';
import { postRegister, postVerify, postLogin, GoogleCallbackController, refreshTokenController } from '../controllers/user/auth.controller';
import { checkValidJwt } from '../middleware/jwt.middleware';
import passport from 'passport';


const router = express.Router();


const apiRoutes = (app: Express) => {
    router.post('/register', postRegister);

    router.post('/verify', postVerify)

    router.post('/login', postLogin)

    router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

    // Google callback
    router.get(
        "/auth/google/callback",
        passport.authenticate("google", { session: false }),
        GoogleCallbackController
    );

    router.post("/refresh-token", refreshTokenController);

    app.use('/', checkValidJwt, router);
};

export default apiRoutes;