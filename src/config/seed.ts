import { hashPassword } from "../services/user/auth.services";
import { prisma } from "./client";


const initDatabase = async () => {
    const count = await prisma.user.count();
    const countRole = await prisma.role.count();
    const defaultPassword = await hashPassword("123456")
    const countProduct = await prisma.product.count();
    const countCategory = await prisma.category.count();
    const countPaymentMethod = await prisma.paymentMethod.count();

    if (countRole === 0) {
        await prisma.role.createMany({
            data: [
                {
                    name: 'ADMIN',
                    description: 'Quản trị viên'
                },
                {
                    name: 'USER',
                    description: 'Người dùng'
                }
            ]
        })
    }
    if (count === 0) {
        const adminRole = await prisma.role.findFirst({
            where: { name: "ADMIN" }
        })
    }
    if (countRole === 0 && count === 0) {
        console.log("Database already seeded");
    }
    if (countCategory === 0) {
        await prisma.category.createMany({
            data: [
                { name: 'FRIED_CHICKEN', description: 'Các món gà rán giòn rụm, hấp dẫn.' },
                { name: 'LIGHT_FOOD', description: 'Đồ ăn nhẹ như khoai tây chiên, xúc xích, phô mai que.' },
                { name: 'DRINKS', description: 'Nước ngọt, trà sữa, nước trái cây, v.v.' },
                { name: 'BURGER', description: 'Các loại bánh mì burger kẹp thịt, gà, cá,...' }
            ]
        })
    }
    if (countProduct === 0) {

        await prisma.product.createMany({
            data: [
                {
                    name: 'Gà Rán Truyền Thống',
                    price: 45000,
                    image: '0f64a538-7d04-472a-a546-a1b27305d105.jpg',
                    description: 'Miếng gà rán giòn tan với lớp vỏ truyền thống.',
                    quantity: 100,
                    categoryId: 2
                },
                {
                    name: 'Gà Rán Cay Hàn Quốc',
                    price: 55000,
                    image: '1a79fd71-d3a3-436f-bd1f-87dbc46a0115.jpg',
                    description: 'Gà rán cay phong cách Hàn Quốc, vị ngọt cay hấp dẫn.',
                    quantity: 80,
                    categoryId: 2
                },

                // Thức ăn nhẹ
                {
                    name: 'Khoai Tây Chiên',
                    price: 30000,
                    image: 'french-fries-1846083_1280.jpg',
                    description: 'Khoai tây chiên giòn rụm, vàng ươm.',
                    quantity: 120,
                    categoryId: 3
                },
                {
                    name: 'Phô Mai Que',
                    price: 25000,
                    image: 'phomaique.png',
                    description: 'Phô mai kéo sợi, giòn bên ngoài, tan chảy bên trong.',
                    quantity: 90,
                    categoryId: 3
                },

                // Thức uống
                {
                    name: 'Coca-Cola',
                    price: 15000,
                    image: 'coca.jpg',
                    description: 'Nước ngọt có ga mát lạnh, giải khát.',
                    quantity: 200,
                    categoryId: 4
                },
                {
                    name: 'Trà Chanh Mật Ong',
                    price: 20000,
                    image: 'trachanh.jpg',
                    description: 'Trà chanh tươi mát với hương vị mật ong thơm nhẹ.',
                    quantity: 150,
                    categoryId: 4
                },

                // Burger
                {
                    name: 'Burger Bò Phô Mai',
                    price: 60000,
                    image: 'burger.jpg',
                    description: 'Burger bò kèm phô mai béo ngậy.',
                    quantity: 70,
                    categoryId: 5
                },
                {
                    name: 'Burger Gà Giòn',
                    price: 55000,
                    image: 'humburger-ga-1.png',
                    description: 'Burger kẹp gà rán giòn, xốt mayonnaise.',
                    quantity: 85,
                    categoryId: 5
                }
            ]
        })
    }
    if (countPaymentMethod === 0) {
        await prisma.paymentMethod.createMany({
            data: [
                { name: 'COD' },
                { name: 'BANKING' }
            ]
        });
    }
    if (countRole !== 0 && count !== 0 && countProduct !== 0) {
        console.log(">>> ALREADY INIT DATA...");
    }
}

export default initDatabase