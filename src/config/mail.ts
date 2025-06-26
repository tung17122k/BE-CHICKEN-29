import nodemailer from 'nodemailer';
import 'dotenv/config'



const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,     // chicken29@gmail.com
        pass: process.env.GMAIL_PASS,     // app password
    },
});

export async function sendVerificationEmail(toEmail, verificationCode) {
    await transporter.sendMail({
        from: `"Chicken29" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: "Mã xác minh tài khoản",
        text: `Xin chào,\n\nMã xác minh của bạn là: ${verificationCode}`,
    });
}