import { z } from "zod";
import { prisma } from "../config/client";
import { emailSchema, isEmailExist, passwordSchema } from "./common";



export const RegisterSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type TRegisterSchema = z.infer<typeof RegisterSchema>;