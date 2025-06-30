import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import 'dotenv/config';


const checkValidJwt = (req: Request, res: Response, next: NextFunction) => {
    const path = req.path;

    const whiteList = [
        "/login",
        "/register",
        "/logout",
        "/verify",
        "/auth/google",
        "/auth/google/callback",
        "/refresh-token"
    ]

    if (whiteList.includes(path)) {
        return next();
    }

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "Unauthorized access, token is missing" });
    } else {
        try {
            console.log("req.method", req.method);

            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
            if (path === "/users" && decoded.role !== "ADMIN") {
                res.status(403).json({
                    message: "Forbidden. You are not allowed to access this resource.",
                    errorCode: 403,
                });
            }
            if (req.method === 'POST' && path === "/product" && decoded.role !== "ADMIN") {
                res.status(403).json({
                    message: "Forbidden. You are not allowed to access this resource.",
                    errorCode: 403,
                });
            }

            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                accountType: decoded.accountType,
                name: decoded.name || "",
                roleId: decoded.roleId,
                phone: decoded.phone || "",
                address: decoded.address || "",
            }

            next();
        } catch (error) {
            console.error("JWT verification failed:", error);
            res.status(401).json({ message: "Invalid token" });
        }
    }



}


export {
    checkValidJwt
}