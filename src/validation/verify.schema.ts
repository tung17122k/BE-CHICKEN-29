import { z } from "zod";
import { prisma } from "../config/client";
import { isEmailExistWithVerify } from "./common";


const emailSchemaWithVerify = z.string().email({ message: "Email is invalid" }).refine(async (email) => {
    const existingUsers = await isEmailExistWithVerify(email);
    if (existingUsers) {
        return true;
    } else {
        return false;
    }
}, { message: "Email không tồn tại!" });

const codeSchema = z.string().length(6, { message: "Mã xác minh phải có 6 ký tự" });

export const VerifySchema = z.object({
    email: emailSchemaWithVerify,
    code: codeSchema
})

export type TVerifySchema = z.infer<typeof VerifySchema>;