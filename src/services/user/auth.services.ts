import bcrypt from "bcrypt";
import { prisma } from "../../config/client";
import { ACCOUNT_TYPE } from "../../config/constant";
import { sendVerificationEmail } from "../../config/mail";
import jwt from "jsonwebtoken";
import { AppError } from "../../utils/appError";
const saltRounds = 10;


const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, saltRounds);
}

const comparePassword = async (plainText: string, hashPassword: string) => {
    return await bcrypt.compare(plainText, hashPassword);
}

const postRegisterService = async (email: string, password: string) => {
    const defaultPassword = await hashPassword(password);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const userRole = await prisma.role.findUnique({
        where: {
            name: "USER"
        }
    })
    try {
        const newUser = await prisma.user.create({
            data: {
                email: email,
                password: defaultPassword,
                roleId: userRole?.id,
                accountType: ACCOUNT_TYPE.SYSTEM,
                isVerified: false,
                verificationCode: verificationCode,
            }
        })

        if (newUser) {
            sendVerificationEmail(email, verificationCode);
        } else {
            throw new Error("Không thể tạo tài khoản người dùng");
        }

        return newUser;
    } catch (error) {
        console.log("error", error);
        throw new Error("Lỗi: Không thể tạo tài khoản người dùng");
    }
}


const postVerifyService = async (email: string, code: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email,
            isVerified: false
        }
    })
    if (!user) {
        throw new Error("Email không tồn tại hoặc không hợp lệ");
    } else {
        if (user.verificationCode === code) {
            const updateUser = await prisma.user.update({
                where: {
                    email: email
                },
                data: {
                    isVerified: true,
                    verificationCode: null,
                }
            })
            return updateUser;
        } else {
            throw new Error("Mã xác minh không chính xác");
        }
    }
}

const postLoginService = async (email: string, password: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
                isVerified: true
            },
            include: {
                role: true
            }
        })
        if (!user) {
            throw new AppError(`User ${email} not found`, 404);
        }
        const isMatch = await comparePassword(password, user.password)

        if (!isMatch) {
            throw new AppError(`Incorrect password`, 401);
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role.name,
            accountType: user.accountType,
            name: user.name || "",
            roleId: user.roleId,
            phone: user.phone || "",
            address: user.address || "",
        }
        const access_token = jwt.sign(payload, process.env.JWT_SECRET as string, {
            expiresIn: '7d' // Thời gian hết hạn của token
        });

        const refresh_token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
            expiresIn: '30d',
        });

        return { access_token, refresh_token, user: payload };
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 500);
    }

}


const GoogleCallbackService = async (user) => {
    if (!user) {
        throw new AppError("User not found", 404);
    }
    try {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            accountType: user.accountType,
            name: user.name || "",
            roleId: user.roleId,
            phone: user.phone || "",
            address: user.address || "",
        }
        const access_token = jwt.sign(payload, process.env.JWT_SECRET as string, {
            expiresIn: '7d' // Thời gian hết hạn của token
        })
        const refresh_token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
            expiresIn: '30d',
        });
        return { access_token, refresh_token, user: payload };
    } catch (error) {
        throw new AppError(error.message, error.statusCode);
    }

}

const refreshTokenService = async (refresh_token: string) => {
    try {
        if (!refresh_token) {
            throw new AppError("Refresh token không hợp lệ.", 401);
        }
        const decoded: any = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);

        if (!decoded.email) {
            throw new AppError("User not found", 400);
        }

        const user = await prisma.user.findUnique({
            where: {
                email: decoded.email,
                isVerified: true
            },
            include: {
                role: true
            }

        })

        if (!user) {
            throw new AppError("User not found", 404);
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role.name,
            accountType: user.accountType,
            name: user.name || "",
            roleId: user.roleId,
            phone: user.phone || "",
            address: user.address || "",
        }

        const newAccessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET as string,
            {
                expiresIn: '7d'
            }
        );

        return { access_token: newAccessToken };
    } catch (error) {
        throw new AppError(error.message, error.statusCode);
    }


}

export { postRegisterService, postVerifyService, postLoginService, GoogleCallbackService, refreshTokenService };