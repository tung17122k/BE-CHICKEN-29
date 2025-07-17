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


export const isProductExist = async (productId: number) => {
    const product = await prisma.product.findUnique({
        where: {
            id: productId
        }
    })
    console.log("product", product);

    if (product) {
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

export const quantitySchema = z.number()
    .transform((val) => (val < 0 ? 0 : Number(val)))
    .refine((num) => num > 0, {
        message: "Số lượng tối thiểu là 1",
    })

export const productIdSchema = z.number({ message: "productId is invalid" }).refine(async (productId) => {
    const existingProductId = await isProductExist(+productId);
    // console.log("existingProductId", existingProductId);
    return existingProductId
}, { message: "ProductId không tồn tại" });
