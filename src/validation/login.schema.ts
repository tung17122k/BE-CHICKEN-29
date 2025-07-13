import { z } from "zod";
import { isEmailExistWithLogin, passwordSchema } from "./common";




const emailSchemaWithVerify = z.string().email({ message: "Email Không hợp lệ" })


export const LoginSchema = z.object({
    email: emailSchemaWithVerify,
    password: passwordSchema
})

export type TLoginSchema = z.infer<typeof LoginSchema>;