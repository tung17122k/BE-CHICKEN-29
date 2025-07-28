# 🍗 BE-CHICKEN-29 - Backend cho ứng dụng đặt đồ ăn Chicken29

Đây là backend chính thức cho **Chicken29** – một ứng dụng đặt đồ ăn trực tuyến. API được xây dựng bằng **Node.js**, **Express**, và **Prisma ORM** với cơ sở dữ liệu **MySQL**. Dự án hỗ trợ các chức năng xác thực, quản lý người dùng, sản phẩm, đơn hàng và tích hợp thanh toán **VNPay**.

---

## 🚀 Chức năng chính

### ✅ Xác thực & phân quyền
- Đăng ký / Đăng nhập bằng email, mật khẩu
- Đăng nhập bằng Google (OAuth2 - Passport)
- Phân quyền người dùng (user / admin)
- Refresh token (JWT)

### 📦 Quản lý hệ thống
- Quản lý sản phẩm (CRUD)
- Quản lý người dùng
- Quản lý đơn hàng
- Upload hình ảnh sản phẩm (dùng Multer)

### 💳 Thanh toán VNPay
- Tạo URL thanh toán
- Nhận phản hồi (return_url)
- IPN: xử lý callback từ VNPay
- Cập nhật trạng thái đơn hàng

---

## 🧑‍💻 Công nghệ sử dụng

| Công nghệ                | Mô tả                                |
|--------------------------|----------------------------------------|
| **Express 5**            | Framework backend chính               |
| **TypeScript**           | Tăng độ an toàn, kiểm tra kiểu       |
| **Prisma ORM**           | Giao tiếp cơ sở dữ liệu MySQL        |
| **Passport.js**          | Xác thực OAuth2 (Google)             |
| **JWT**                  | Xác thực & phân quyền qua token      |
| **Multer**               | Xử lý upload hình ảnh                |
| **Nodemailer**           | Gửi email thông báo đơn hàng         |
| **VNPay**                | Tích hợp thanh toán                   |
| **Zod**                  | Validate dữ liệu vào (schema-based)  |

---

## 🛠️ Cài đặt và chạy server

```bash
# 1. Clone project
git clone https://github.com/tung17122k/BE-CHICKEN-29.git
cd BE-CHICKEN-29

# 2. Cài dependencies
npm install

# 3. Cấu hình Prisma
npx prisma generate

# 4. Migrate database
npx prisma migrate dev

# 5. Tạo file .env
cp .env.example .env

# 6. Chạy development
npm run dev
