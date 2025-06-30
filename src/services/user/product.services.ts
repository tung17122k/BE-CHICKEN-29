import { prisma } from "../../config/client";

const countTotalPages = async (limit: number) => {
    const totalItems = await prisma.product.count();
    const totalPages = Math.ceil(totalItems / limit)
    return totalPages
}

const getAllProduct = async () => {
    try {
        const products = await prisma.product.findMany()
        return products
    } catch (error) {
        throw new Error("Không thể lấy danh sách sản phẩm");
    }
}

const handleGetProductService = async (page: number, limit: number, name?: string) => {
    try {
        let currentPage = page ? page : 1;
        if (currentPage <= 0) currentPage = 1;
        const products = await prisma.product.findMany({
            where: {
                name: {
                    contains: name
                }
            },
            take: limit,
            skip: (currentPage - 1) * limit
        })
        return products
    } catch (error) {
        throw new Error("Không thể lấy danh sách sản phẩm");
    }

}

const handleCreateProductService = async (name: string, price: number, description: string, quantity: number, sold: number, categoryId: number, image: string) => {
    try {
        const newProduct = await prisma.product.create({
            data: {
                name: name,
                price: +price,
                description: description,
                quantity: +quantity,
                sold: sold,
                categoryId: categoryId,
                image: image
            }
        })
        return newProduct
    } catch (error) {
        throw new Error("Error creating product")
    }
}


export { countTotalPages, getAllProduct, handleGetProductService, handleCreateProductService };