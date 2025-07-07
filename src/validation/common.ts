import { z } from "zod";
import { prisma } from "../config/client";

export const isEmailExist = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if (user) {
        return true
    } else {
        return false
    }
}

export const isEmailExistWithVerify = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email,
            isVerified: false
        }
    })
    if (user) {
        return true
    } else {
        return false
    }
}


export const isEmailExistWithLogin = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email,
            isVerified: true
        }
    })
    if (user) {
        return true
    } else {
        return false
    }
}


export const emailSchema = z.string().email({ message: "Email is invalid" }).refine(async (email) => {
    const existingUsers = await isEmailExist(email);
    return !existingUsers;
}, { message: "Email already exists" });


export const emailSocialSchema = z.string().email({ message: "Email is invalid" });
export const typeSchema = z.string({ message: "Type is invalid" });

export const passwordSchema = z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(20, { message: "Password must not exceed 20 characters" })
    .refine((password) => /[A-Z]/.test(password), {
        message: "Password must contain at least one uppercase letter",
    })