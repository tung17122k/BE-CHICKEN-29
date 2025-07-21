import { z } from "zod"

export const OrderSchema = z.object({
    id: z.string().optional(),
    receiverName: z.string().trim().min(1, { message: "Tên là bắt buộc" }),
    receiverAddress: z.string().trim().min(1, { message: "Địa chỉ là bắt buộc" }),
    receiverPhone: z
        .string()
        .trim()
        .regex(
            /^\+84\d{9}$/,
            { message: "Số điện thoại phải bắt đầu bằng +84 và có 9 chữ số sau đó" }
        ),
})

export type TOrderSchema = z.infer<typeof OrderSchema>;