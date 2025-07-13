import { Request, Response } from "express";
import { getCategoryService } from "../../services/user/category.services";


const getCategory = async (req: Request, res: Response) => {
    const result = await getCategoryService();
    res.status(200).json({
        data: result
    })
}

export {
    getCategory
}