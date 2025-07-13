import { prisma } from "../../config/client";

const getCategoryService = async () => {
    const category = await prisma.category.findMany();
    return category
}

export {
    getCategoryService
}

