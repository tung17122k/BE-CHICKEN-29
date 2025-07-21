import { prisma } from "../../config/client";
import { RequestUser } from "../../types";
import { AppError, CartUpdateError, DatabaseError } from "../../utils/appError";
import { TCartItem, TCartItemWithId } from "../../validation/cart/cart.schema";





const postProductToCartService = async (user: RequestUser, productList: TCartItem[]
) => {
    let sum = 0
    try {
        // console.log("user", user);
        // console.log('product', product);
        const cart = await prisma.cart.findUnique({
            where: {
                userId: user.id
            }
        })

        for (let i = 0; i < productList.length; i++) {
            sum += Number(productList[i].quantity)
        }
        // console.log("sum", sum);


        await prisma.$transaction(async (tx) => {
            if (cart) {
                await prisma.cart.update({
                    where: { userId: user.id },
                    data: {
                        sum: {
                            increment: +sum
                        }
                    }
                })

                for (const item of productList) {
                    const existCartDetail = await tx.cartDetail.findFirst({
                        where: {
                            cartId: cart.id,
                            productId: Number(item.productId)
                        }
                    })


                    if (existCartDetail) {

                        await tx.cartDetail.update({
                            where: {
                                id: existCartDetail.id
                            },
                            data: {
                                quantity: {
                                    increment: +item.quantity
                                }
                            }
                        })
                    } else {
                        const product = await tx.product.findUnique({
                            where: {
                                id: +item.productId
                            }
                        })

                        await tx.cartDetail.create({
                            data: {
                                cartId: +cart.id,
                                productId: Number(item.productId),
                                quantity: +item.quantity,
                                price: product.price
                            }
                        })
                    }
                }
            } else {
                // create new cart
                const newCart = await prisma.cart.create({
                    data: {
                        userId: user.id,
                        sum: +sum
                    }
                })

                for (const item of productList) {
                    const product = await tx.product.findUnique({
                        where: {
                            id: +item.productId
                        }
                    })

                    await tx.cartDetail.create({
                        data: {
                            cartId: newCart.id,
                            productId: +item.productId,
                            quantity: +item.quantity,
                            price: product.price
                        }
                    })
                }
            }
        })

        const cartCurrent = await prisma.cart.findUnique({
            where: {
                userId: user.id
            }
        })
        return cartCurrent

    } catch (error) {
        console.log("error", error);
    }
}

const getCartByIdService = async (user: RequestUser) => {
    try {
        const cart = await prisma.cart.upsert({
            where: {
                userId: user.id
            },
            update: {},
            create: {
                userId: user.id,
                sum: 0
            },
            include: {
                cartDetails: {
                    include: {
                        product: true
                    }
                }
            }
        });
        // console.log("cart", cart);
        return cart;


    } catch (error) {
        // console.log("error", error);
        throw new DatabaseError();
    }
}

const updateCartService = async (user: RequestUser, cartDetailList: TCartItemWithId[]) => {
    try {
        let sum = 0
        for (let i = 0; i < cartDetailList.length; i++) {
            sum += Number(cartDetailList[i].quantity)
        }
        // console.log("sum", sum);

        // cap nhat tong san pham trong cart
        const cart = await prisma.cart.update({
            where: {
                userId: user.id
            },
            data: {
                sum: sum
            }
        })
        // cap nhat cart detail

        for (let i = 0; i < cartDetailList.length; i++) {
            const { id, quantity } = cartDetailList[i];
            if (quantity === 0) {
                await prisma.cartDetail.delete({
                    where: { id }
                });
            } else {
                await prisma.cartDetail.update({
                    where: { id },
                    data: { quantity }
                });
            }
        }
        return cart

    } catch (error) {
        throw new CartUpdateError('Unable to update cart for user');
    }

}

export {
    postProductToCartService, getCartByIdService, updateCartService
}