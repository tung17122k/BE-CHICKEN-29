import { z } from "zod"
import { productIdSchema, quantitySchema } from "../common";


export const CartItemSchema = z.object({
    productId: productIdSchema,
    quantity: quantitySchema
});

export const CartSchema = z.object({
    product: z.array(CartItemSchema).min(1, { message: "Phải có ít nhất 1 sản phẩm" })
});

export type TCartSchema = z.infer<typeof CartSchema>;

export type TCartItem = z.infer<typeof CartItemSchema>; 