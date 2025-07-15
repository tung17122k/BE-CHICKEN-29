import { prisma } from "../../config/client";
import { InvalidCategoryError } from "../../utils/appError";

const countTotalPages = async (limit: number) => {
    const totalItems = await prisma.product.count();
    const totalPages = Math.ceil(totalItems / limit)
    return totalPages
}

const getAllProduct = async (categoryName?: string) => {
    const category = await prisma.category.findFirst({
        where: {
            name: categoryName
        }
    })
    const categoryId = category.id

    try {
        if (categoryName) {
            const products = await prisma.product.findMany({
                where: {
                    categoryId: categoryId
                }
            })
            return products
        } else {
            const products = await prisma.product.findMany()
            return products
        }
    } catch (error) {
        throw new Error("Không thể lấy danh sách sản phẩm");
    }
}

const handleGetProductService = async (page: number, limit: number, categoryName?: string) => {
    try {
        let currentPage = page ? page : 1;
        if (currentPage <= 0) currentPage = 1;

        const category = await prisma.category.findFirst({
            where: {
                name: categoryName
            }
        })
        const categoryId = category.id

        const productArr = await prisma.product.findMany({
            where: {
                categoryId: categoryId
            }
        })

        if (categoryName) {
            const products = await prisma.product.findMany({
                where: {
                    categoryId: categoryId
                },
                take: limit,
                skip: (currentPage - 1) * limit
            })
            let totalPages = productArr?.length / limit
            return { products, totalPages }
        } else {
            const products = await prisma.product.findMany({
                take: limit,
                skip: (currentPage - 1) * limit
            })
            const allProduct = await getAllProduct()
            let totalPages = allProduct?.length / limit
            return { products, totalPages }
        }

    } catch (error) {
        throw new Error("Không thể lấy danh sách sản phẩm");
    }

}

const handleCreateProductService = async (name: string, price: number, description: string, quantity: number, sold: number, categoryId: number, image: string) => {

    try {
        // kiểm tra categoryId có thuộc categoryId không 
        let isCategoryExist: boolean
        const categoryList = await prisma.category.findMany({})
        // console.log("category", categoryList);

        for (let i = 0; i < categoryList.length; i++) {
            if (categoryList[i].id === categoryId) {
                isCategoryExist = true
            }
        }

        if (isCategoryExist) {

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
        }
    } catch (error) {
        throw new Error("Error creating product")
    }
}

const getProductByIdService = async (id: number) => {
    try {
        const product = await prisma.product.findUnique({
            where: {
                id: id
            }
        })
        return product
    } catch (error) {
        throw new Error("Error getting product by id")
    }
}


export { countTotalPages, getAllProduct, handleGetProductService, handleCreateProductService, getProductByIdService };