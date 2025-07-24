import express, { Express } from 'express';
import { postRegister, postVerify, postLogin, GoogleCallbackController, refreshTokenController, loginSocialMediaController } from '../controllers/user/auth.controller';
import { checkValidJwt } from '../middleware/jwt.middleware';
import passport from 'passport';
import { getProductById, getProductController, postCreateProductController } from '../controllers/user/product.controller';
import fileUploadMiddleware from '../middleware/multer';
import { getCategory } from '../controllers/user/category.controller';
import { getCartById, postProductToCart, updateCart } from '../controllers/user/cart.controller';
import { postPlaceOrder } from '../controllers/user/order.controller';
import { getVNPayIpnController, getVNPayReturnController } from '../controllers/user/payment.controller';
// import { postCreatePaymentUrl } from '../controllers/user/payment.controller';




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

    router.get('/category', getCategory)

    router.post('/cart', postProductToCart)

    router.get('/cart', getCartById)

    router.patch('/cart', updateCart)

    router.post('/checkout', postPlaceOrder)

    // router.post('/create_payment_url', postCreatePaymentUrl)

    router.get('/vnpay_return', getVNPayReturnController)

    router.get('/vnpay_ipn', getVNPayIpnController)

    app.use('/', checkValidJwt, router);
};

export default apiRoutes;