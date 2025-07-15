import { z } from "zod";
import { prisma } from "../config/client";
import { emailSchema, emailSocialSchema, isEmailExist, passwordSchema, typeSchema } from "./common";



export const RegisterSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type TRegisterSchema = z.infer<typeof RegisterSchema>;

export const RegisterSocialSchema = z.object({
    email: emailSocialSchema,
    type: typeSchema
});

export type TRegisterSocialSchema = z.infer<typeof RegisterSocialSchema>;