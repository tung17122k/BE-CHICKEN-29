import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import 'dotenv/config';
import { prisma } from "./client";
import { ACCOUNT_TYPE } from "./constant";


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: Express.User | false | null) => void) => {
    try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(null, false);
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            const role = await prisma.role.findUnique({ where: { name: "USER" } });
            const userCreate = await prisma.user.create({
                data: {
                    email: email,
                    isVerified: true,
                    name: profile.displayName || "",
                    roleId: role?.id || 1,
                    accountType: ACCOUNT_TYPE.GOOGLE,
                    password: "",
                    verificationCode: null,
                    address: "",
                    phone: ""
                }
            })
            return done(null, {
                id: userCreate.id,
                email: userCreate.email,
                accountType: userCreate.accountType,
                name: userCreate.name || "",
                roleId: userCreate.roleId,
                phone: userCreate.phone || "",
                address: userCreate.address || "",
            });
        } else {
            return done(null, {
                id: user.id,
                email: user.email,
                accountType: user.accountType,
                name: user.name || "",
                roleId: user.roleId,
                phone: user.phone || "",
                address: user.address || "",
            });
        }
    } catch (error) {
        done(error, false);
    }
}))
