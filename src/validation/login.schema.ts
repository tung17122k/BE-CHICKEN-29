import { z } from "zod";
import { isEmailExistWithLogin, passwordSchema } from "./common";




const emailSchemaWithVerify = z.string().email({ message: "Email is invalid" }).refine(async (email) => {
    const existingUsers = await isEmailExistWithLogin(email);
    if (existingUsers) {
        return true;
    } else {
        return false;
    }
}, { message: "Email không hợp lệ" });


export const LoginSchema = z.object({
    email: emailSchemaWithVerify,
    password: passwordSchema
})

export type TLoginSchema = z.infer<typeof LoginSchema>;