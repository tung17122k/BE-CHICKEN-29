import { prisma } from "../../config/client"
import { RequestUser } from "../../types"


const handlePlaceOrder = async (userId: number, receiverName: string, receiverAddress: string, receiverPhone: string, paymentMethod: string) => {

    return await prisma.$transaction(async (tx) => {
        const cart = await tx.cart.findUnique({
            where: {
                userId: userId
            },
            include: {
                cartDetails: true
            }
        })
        console.log("cart", cart);

        const paymentMethodData = await tx.paymentMethod.findFirst({
            where: {
                name: paymentMethod
            }
        })

        if (!paymentMethodData) {
            throw new Error("Phương thức thanh toán không hợp lệ");
        }

        if (cart) {
            let totalPrice = cart.cartDetails.reduce((sum, item) => sum + item.price * item.quantity, 0)
            // console.log("totalPrice", totalPrice);
            // create order 
            const dataOrderDetail = cart?.cartDetails?.map(item => ({
                price: item.price,
                quantity: item.quantity,
                productId: item.productId
            })) ?? []

            const createdOrder = await tx.order.create({
                data: {
                    receiverName,
                    receiverAddress,
                    receiverPhone,
                    paymentMethodId: paymentMethodData.id,
                    paymentStatus: 'PAYMENT_UNPAID',
                    status: "PENDING",
                    totalPrice: totalPrice,
                    userId,
                    orderDetails: {
                        create: dataOrderDetail
                    }
                }
            })
            // remore cartDetail
            await tx.cartDetail.deleteMany({
                where: {
                    cartId: cart.id
                }
            })
            // remove cart 
            await tx.cart.delete({
                where: {
                    id: cart.id
                }
            })

            for (let i = 0; i < cart.cartDetails.length; i++) {
                const productId = cart.cartDetails[i].productId;
                const product = await tx.product.findUnique({
                    where: {
                        id: productId
                    }
                })
                if (!product || product.quantity < cart.cartDetails[i].quantity) {
                    throw new Error(`sản phẩm ${product?.name} không tồn tại hoặc không đủ số lượng!`)
                }
                await tx.product.update({
                    where: {
                        id: productId
                    },
                    data: {
                        quantity: {
                            decrement: cart.cartDetails[i].quantity
                        },
                        sold: {
                            increment: cart.cartDetails[i].quantity
                        }
                    }
                })
            }
            // console.log("createdOrder.id", createdOrder.id)
            return createdOrder



        }
    })



}


export {
    handlePlaceOrder
}