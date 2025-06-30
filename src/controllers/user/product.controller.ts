import { NextFunction, Request, Response } from "express";
import { countTotalPages, getAllProduct, handleCreateProductService, handleGetProductService } from "../../services/user/product.services";
import { ProductSchema, TProductSchema } from "../../validation/product/product.schema";

const getProductController = async (req: Request, res: Response) => {
    const { page, limit, name } = req.query;
    try {
        if (!page && !limit) {
            const products = await getAllProduct();
            res.status(200).json({
                message: "Get product successfully",
                data: products
            });
        } else {
            const totalPages = await countTotalPages(+limit)
            const products = await handleGetProductService(+page, + limit, name as string);
            res.status(200).json({
                message: "Get product successfully",
                data: products,
                totalPages: totalPages
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Get product failed",
            error: (error as Error).message
        });
    }

}

const postCreateProductController = async (req: Request, res: Response) => {
    const { name, price, description, quantity, sold, categoryId } = req.body as TProductSchema;
    const validate = ProductSchema.safeParse(req.body);
    // console.log(">>>>validate", validate);
    if (validate.success === false) {
        //error 
        const errorsZod = validate.error.issues;
        // console.log(">>>>errorsZod", errorsZod);

        const errors = errorsZod?.map((error) => {
            return {
                field: error.path.join('.'),
                message: error.message
            }
        })
        res.status(400).json({
            message: "Validation error",
            errors: errors
        });
    }
    try {
        if (validate.success) {
            const file = req.file;
            const image = file?.filename ?? null;
            const result = await handleCreateProductService(name, +price, description, +quantity, +sold, +categoryId, image)
            if (result) {
                res.status(200).json({
                    message: "Product created successfully",
                    data: result
                });
            }
        }
    } catch (error) {
        console.log("error", error);
        res.status(500).json({
            message: "Error creating product"
        });
    }

}


export { getProductController, postCreateProductController };