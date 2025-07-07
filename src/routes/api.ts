import express, { Express } from 'express';
import { postRegister, postVerify, postLogin, GoogleCallbackController, refreshTokenController, loginSocialMediaController } from '../controllers/user/auth.controller';
import { checkValidJwt } from '../middleware/jwt.middleware';
import passport from 'passport';
import { getProductById, getProductController, postCreateProductController } from '../controllers/user/product.controller';
import fileUploadMiddleware from '../middleware/multer';


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

    router.post('/auth/social-media', loginSocialMediaController)

    router.get('/product', getProductController)

    router.post('/product', fileUploadMiddleware('image', 'images/product'), postCreateProductController);

    router.get('/product/:id', getProductById)

    app.use('/', checkValidJwt, router);
};

export default apiRoutes;