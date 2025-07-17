import { Request, Response } from "express";
import { CartSchema, TCartItem } from "../../validation/cart/cart.schema";
import { getCartByIdService, postProductToCartService } from "../../services/user/cart.services";
import { AppError } from "../../utils/appError";

const postProductToCart = async (req: Request, res: Response) => {
    const { product }: { product: TCartItem[] } = req.body;
    const user = req.user

    const validate = await CartSchema.safeParseAsync({ product });
    if (!validate.success) {
        const errors = validate.error.issues.map((error) => ({
            field: error.path.join('.'),
            message: error.message,
        }));

        res.status(400).json({ message: errors });
    }

    try {
        const result = await postProductToCartService(user, product)
        res.status(201).json({
            message: "Thêm sản phẩm thành công",
            data: result
        });
    } catch (error) {
        console.log("error", error)
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
}


const getCartById = async (req: Request, res: Response) => {
    const user = req.user
    try {
        const result = await getCartByIdService(user)
        if (result) {
            res.status(200).json({ message: "Lấy thành công giỏ hàng", data: result });
        }
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                status: error.status,
                message: error.message,
                code: error.errorCode,
                metadata: error.metadata || null
            });
        } else {
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}


export { postProductToCart, getCartById }