import { z } from "zod"

export const ProductSchema = z.object({
    id: z.string().optional(),
    name: z.string().trim().min(1, { message: "Tên là bắt buộc" }),
    price: z.string()
        .transform((val) => (val === "" ? 0 : Number(val)))
        .refine((num) => num > 0, {
            message: "Số tiền tối thiểu là 1",
        }),
    description: z.string().trim().min(1, { message: "Mô tả là bắt buộc" }),
    quantity: z.string()
        .transform((val) => (val === "" ? 0 : Number(val)))
        .refine((num) => num > 0, {
            message: "Số lượng tối thiểu là 1",
        }),
    sold: z.string()
        .transform((val) => (val === "" ? 0 : Number(val)))
        .refine((num) => num >= 0, {
            message: "Đã bán được thiểu là 0",
        }),
    categoryId: z.string()
        .transform((val) => (val === "" ? 0 : Number(val)))
        .refine((num) => num > 0, {
            message: "Danh mục là bắt buộc",
        }),
})

export type TProductSchema = z.infer<typeof ProductSchema>;