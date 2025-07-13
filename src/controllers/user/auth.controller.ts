import { NextFunction, Request, Response } from "express";
import { RegisterSchema, RegisterSocialSchema, TRegisterSchema, } from "../../validation/register.schema";
import { postRegisterService, postVerifyService, postLoginService, GoogleCallbackService, refreshTokenService, postRegisterSocialMediaService } from "../../services/user/auth.services";
import { TVerifySchema, VerifySchema } from "../../validation/verify.schema";
import { LoginSchema, TLoginSchema } from "../../validation/login.schema";
import { User } from "@prisma/client";
import { ACCOUNT_TYPE } from "../../config/constant";

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
            // console.log("result", result);
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
                message: errors,
                // errors: errors
            });

        } else {
            const result = await postLoginService(email, password);
            console.log("result", result);

            if (result) {
                res.cookie("refresh_token", result.refresh_token, {
                    // httpOnly: true, // Không thể truy cập từ JavaScript (chống XSS)
                    // secure: true, // Chỉ gửi qua HTTPS (cần bật khi deploy)
                    sameSite: "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
                });


                res.status(200).json({
                    message: "Đăng nhập thành công",
                    data: {
                        access_token: result.access_token,
                        refresh_token: result.refresh_token,
                        user: result.user
                    }
                });
            }
        }
    } catch (error) {
        console.log("error", error);
        res.status(error.statusCode ? error.statusCode : 500).json({
            message: error.message || "Internal server error",
        });

    }
}


const GoogleCallbackController = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    console.log("Google user:", user);
    const result = await GoogleCallbackService(user as Express.User);
    if (req.user) {
        const user = req.user as Express.User;
        res.status(200).json({
            message: "Login successful",
            user: user,
            access_token: result.access_token
        });
    }
}

const refreshTokenController = async (req: Request, res: Response) => {
    try {
        const refresh_token = req.cookies.refresh_token;
        if (!refresh_token) {
            res.status(401).json({
                message: "Refresh token không hợp lệ.",
            });
        }
        const result = await refreshTokenService(refresh_token)
        console.log("result", result);
        res.status(200).json({
            message: "Token làm mới thành công",
            data: result,
        });
    } catch (error) {
        console.log("error.statusCode", error.statusCode);

        res.status(error.statusCode ? error.statusCode : 500).json({
            error: error.message || "Internal server error",
        });
    }
}
const loginSocialMediaController = async (req: Request, res: Response) => {
    const { email, type } = req.body
    try {
        const validate = await RegisterSocialSchema.safeParseAsync(req.body);
        console.log("validate", validate);

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
            if (email && type !== ACCOUNT_TYPE.SYSTEM) {
                const result = await postRegisterSocialMediaService(email, type);
                console.log("result", result);
                res.status(200).json({
                    data: result
                })
            }
        }


    } catch (error) {
        console.log("error.statusCode", error.statusCode);

        res.status(error.statusCode ? error.statusCode : 500).json({
            error: error.message || "Internal server error",
        });
    }
}




export { postRegister, postVerify, postLogin, GoogleCallbackController, refreshTokenController, loginSocialMediaController };