import { NextFunction, Request, Response } from "express";
import { RegisterSchema, TRegisterSchema, } from "../../validation/register.schema";
import { postRegisterService, postVerifyService, postLoginService } from "../../services/user/auth.services";
import { TVerifySchema, VerifySchema } from "../../validation/verify.schema";
import { LoginSchema, TLoginSchema } from "../../validation/login.schema";

const postRegister = async (req: Request, res: Response) => {
    const { email, password, confirmPassword } = req.body as TRegisterSchema


    try {
        const validate = await RegisterSchema.safeParseAsync(req.body);
        if (!validate.success) {
            const errorsZod = validate.error.issues;
            const errors = errorsZod?.map((error) => {
                return {
                    field: error.path.join('.'),
                    message: error.message
                }
            })
            res.status(400).json({
                message: "Validation error",
                errors: errors
            });
        } else {
            const result = await postRegisterService(email, password);
            if (result) {
                res.status(201).json({
                    message: "Đăng ký thành công, vui lòng kiểm tra email để xác minh tài khoản",
                    user: {
                        email: result.email,
                        isVerified: result.isVerified,
                        accountType: result.accountType
                    }
                });
            } else {
                res.status(500).json({ message: "Failed to register user" });
            }

        }
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Internal server error" });

    }
}

const postVerify = async (req: Request, res: Response) => {
    const { code, email } = req.body as TVerifySchema;

    try {
        const validate = await VerifySchema.safeParseAsync(req.body);

        if (!validate.success) {
            const errorsZod = validate.error.issues;
            const errors = errorsZod?.map((error) => {
                return {
                    field: error.path.join('.'),
                    message: error.message
                }
            })
            res.status(400).json({
                message: "Validation error",
                errors: errors
            });

        } else {
            const result = await postVerifyService(email, code)
            console.log("result", result);
            if (result) {
                res.status(200).json({ message: "Xác thực thành công" })
            }
        }

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
        return;
    }
}

const postLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body as TLoginSchema;
    try {

        const validate = await LoginSchema.safeParseAsync(req.body);

        if (!validate.success) {
            const errorsZod = validate.error.issues;
            const errors = errorsZod?.map((error) => {
                return {
                    field: error.path.join('.'),
                    message: error.message
                }
            })
            res.status(400).json({
                message: "Validation error",
                errors: errors
            });

        } else {
            const result = await postLoginService(email, password);
            if (result) {
                res.status(200).json({
                    message: "Đăng nhập thành công",
                    accessToken: result.access_token,
                    user: result.user
                });
            } else {
                res.status(401).json({ message: "Invalid email or password" });
            }
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });

    }

}

export { postRegister, postVerify, postLogin };