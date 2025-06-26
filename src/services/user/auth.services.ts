import bcrypt from "bcrypt";
import { prisma } from "../../config/client";
import { ACCOUNT_TYPE } from "../../config/constant";
import { sendVerificationEmail } from "../../config/mail";
import jwt from "jsonwebtoken";
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
        throw new Error(`User ${email} not found`);
    }
    const isMatch = await comparePassword(password, user.password)

    if (!isMatch) {
        throw new Error(`Incorrect password`);
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
        expiresIn: '30d' // Thời gian hết hạn của token
    })
    return { access_token, user: payload };
}

export { postRegisterService, postVerifyService, postLoginService };