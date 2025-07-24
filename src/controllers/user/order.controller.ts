import { NextFunction, Request, Response } from "express";
import { handlePlaceOrder } from "../../services/user/order.services";
import { OrderSchema } from "../../validation/order/order.schema";




const postPlaceOrder = async (req: Request, res: Response) => {
    const user = req.user
    const ipAddr = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
    const { receiverName, receiverAddress, receiverPhone, paymentMethod, bankCode } = req.body
    const validate = await OrderSchema.safeParseAsync({ receiverName, receiverAddress, receiverPhone });
    try {
        if (!validate.success) {
            const errors = validate.error.issues.map((error) => ({
                field: error.path.join('.'),
                message: error.message,
            }));
            res.status(400).json({ message: errors });
        } else {
            const result = await handlePlaceOrder(user.id, receiverName, receiverAddress, receiverPhone, paymentMethod, ipAddr, bankCode);
            if (result) {
                res.status(200).json({ message: "Order placed successfully", data: result });
            }

        }
    } catch (error) {
        // console.log("error", error)
        res.status(400).json({ message: error.message });
    }
}





export {
    postPlaceOrder
}