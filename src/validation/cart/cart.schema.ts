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


export const CartItemWithIdSchema = z.object({
    id: z.number().int().positive({ message: "ID phải là số dương" }),
    productId: productIdSchema,
    quantity: z.number().int()
});

export const CartUpdateSchema = z.object({
    cartDetails: z.array(CartItemWithIdSchema)
});

export type TCartItemWithId = z.infer<typeof CartItemWithIdSchema>;