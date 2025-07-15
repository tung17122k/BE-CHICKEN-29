import { NextFunction, Request, Response } from "express";
import { countTotalPages, getAllProduct, getProductByIdService, handleCreateProductService, handleGetProductService } from "../../services/user/product.services";
import { ProductSchema, TProductSchema } from "../../validation/product/product.schema";

const getProductController = async (req: Request, res: Response) => {
    const { page, limit, category } = req.query;
    try {
        if (!page && !limit) {
            if (!category) {
                const products = await getAllProduct(category as string);
                res.status(200).json({
                    message: "Get product successfully",
                    data: products,
                });
            } else {
                const products = await getAllProduct(category as string);
                res.status(200).json({
                    message: "Get product successfully",
                    data: products
                });
            }


        } else {
            // const totalPages = await countTotalPages(+limit)
            const result = await handleGetProductService(+page, + limit, category as string);
            console.log("result", result);

            res.status(200).json({
                message: "Get product successfully",
                data: result.products,
                totalPages: result.totalPages
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
            message: errors,
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

const getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log("id", id);

    try {
        if (!id) {
            res.status(400).json({
                message: "Id product không hợp lệ"
            });
        }
        const product = await getProductByIdService(+id)
        if (product) {
            res.status(200).json({
                message: "Get product successfully",
                data: product
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Error getting product"
        });
    }
}


export { getProductController, postCreateProductController, getProductById };