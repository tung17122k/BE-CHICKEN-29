import 'dotenv/config';
import { Request, Response } from 'express';
import moment from 'moment';
import crypto from 'crypto';
import qs from 'qs';
import { prisma } from '../../config/client';


export function sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    }
    return sorted;
}




const getVNPayReturnController = async (req: Request, res: Response) => {
    let vnp_Params = { ...req.query } as Record<string, string>;

    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const tmnCode = process.env.VNP_TMN_CODE || '';
    const secretKey = process.env.VNP_HASH_SECRET || '';

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
        //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
        const order = await prisma.order.findUnique({
            where: {
                id: parseInt(vnp_Params['vnp_TxnRef']),
            }
        })
        if (!order) {
            res.status(400).json({
                message: 'Order not found',
                responseCode: '01',
            });
        } else {
            res.status(200).json({
                message: 'Giao dịch thành công',
                responseCode: vnp_Params['vnp_ResponseCode'],
                data: vnp_Params,
            });
        }
    } else {
        res.status(400).json({
            message: 'Sai chữ ký',
            responseCode: '97',
        });
    }
}

const getVNPayIpnController = async (req: Request, res: Response) => {
    let vnp_Params = { ...req.query } as Record<string, string>;

    const secureHash = vnp_Params['vnp_SecureHash'];
    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];
    console.log("vnp_Params", vnp_Params);
    console.log("rspCode", rspCode);

    const order = await prisma.order.findFirst({
        where: {
            id: parseInt(req.query.vnp_TxnRef as string),
        }
    })

    console.log("order", order);



    const vnp_Amount = vnp_Params['vnp_Amount'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNP_HASH_SECRET || '';

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // Giả định kiểm tra đơn hàng
    let paymentStatus = 'PAYMENT_UNPAID'; // 0: chưa xử lý
    // let checkOrderId = true; //  kiểm tra orderId có tồn tại trong DB không
    // let checkAmount = true; //  kiểm tra amount có khớp không

    if (secureHash === signed) {
        if (order.id === Number(orderId)) {
            if (order.totalPrice * 100 === parseInt(vnp_Amount)) {
                if (paymentStatus === 'PAYMENT_UNPAID') {
                    if (rspCode === '00') {
                        //  Cập nhật trạng thái đơn hàng thành "PAYMENT_PAID" trong DB
                        await prisma.order.update({
                            where: { id: order.id },
                            data: {
                                paymentStatus: 'PAYMENT_PAID',
                            }
                        });
                        res.status(200).json({ RspCode: '00', Message: 'Success' });
                    } else {
                        //  Cập nhật trạng thái đơn hàng thành "PAYMENT_UNPAID" trong DB
                        res.status(200).json({ RspCode: '00', Message: 'Failed transaction recorded' });
                    }
                } else {
                    res.status(200).json({
                        RspCode: '02',
                        Message: 'This order has already been updated with payment status',
                    });
                }
            } else {
                res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
            }
        } else {
            res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }
    } else {
        res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
    }
}

export {
    getVNPayReturnController, getVNPayIpnController
}