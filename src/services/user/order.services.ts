import { prisma } from "../../config/client"
import { sortObject } from "../../controllers/user/payment.controller"
import { RequestUser } from "../../types"
import moment from 'moment';
import crypto from 'crypto';
import qs from 'qs';
import 'dotenv/config';


const handlePlaceOrder = async (userId: number, receiverName: string, receiverAddress: string, receiverPhone: string, paymentMethod: string, ipAddr: any, bankCode: string) => {

    const result = await prisma.$transaction(async (tx) => {
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
            console.log("totalPrice", totalPrice);
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
            let vnpUrl = '';

            if (paymentMethodData.name === 'BANKING') {
                process.env.TZ = 'Asia/Ho_Chi_Minh';

                const date = new Date();
                const createDate = moment(date).format('YYYYMMDDHHmmss');
                // const orderId = moment(date).format('DDHHmmss');

                const tmnCode = process.env.VNP_TMN_CODE || '';
                const secretKey = process.env.VNP_HASH_SECRET || '';
                const vnpUrlBase = process.env.VNP_URL || '';
                const returnUrl = process.env.VNP_RETURN_URL || '';
                // const amount = 100000; // VND


                const locale = 'vn';
                const currCode = 'VND';

                let vnp_Params: Record<string, string> = {
                    vnp_Version: '2.1.0',
                    vnp_Command: 'pay',
                    vnp_TmnCode: tmnCode,
                    vnp_Locale: locale,
                    vnp_CurrCode: currCode,
                    vnp_TxnRef: createdOrder.id.toString(),
                    vnp_OrderInfo: `Thanh toán mã đơn hàng:${createdOrder.id}`,
                    vnp_OrderType: 'other',
                    vnp_Amount: (totalPrice * 100).toString(), // VNPay yêu cầu nhân 100
                    vnp_ReturnUrl: returnUrl,
                    vnp_IpAddr: ipAddr,
                    vnp_CreateDate: createDate,
                };

                if (bankCode) {
                    vnp_Params['vnp_BankCode'] = bankCode;
                }



                vnp_Params = sortObject(vnp_Params);

                const signData = qs.stringify(vnp_Params, { encode: false });
                // console.log('signData:', signData);

                const hmac = crypto.createHmac('sha512', secretKey);
                const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

                vnp_Params['vnp_SecureHash'] = signed;

                vnpUrl = `${vnpUrlBase}?${qs.stringify(vnp_Params, { encode: false })}`;
                console.log('VNPAY URL:', vnpUrl);

            }

            // console.log("createdOrder.id", createdOrder.id)
            return { createdOrder, vnpUrl }
        }
    })
    return { createdOrder: result.createdOrder, vnpUrl: result.vnpUrl };


}

const handleGetOrderHistory = async (userId: number) => {
    const orders = await prisma.order.findMany({
        where: {
            userId: userId
        },
        include: {
            orderDetails: {
                include: {
                    product: true
                }
            },
            paymentMethod: true
        },
    });
    return orders;
}


export {
    handlePlaceOrder, handleGetOrderHistory
}