# Phần máy chủ RentalRoom

Phần máy chủ Express/Socket.IO sử dụng MongoDB Atlas, cookie làm mới JWT, Cloudinary,
SMTP, Gemini, GHN và thông tin VietQR.

## Biến môi trường

Tạo `.env` cho môi trường phát triển hoặc `/etc/rentalroom/backend.env` cho môi trường triển khai chính thức.
Không đưa tệp chứa thông tin bí mật vào Git. Danh sách đầy đủ nằm tại
`../deploy/env/backend.production.env.example`.

Ví dụ cấu hình tối thiểu cho môi trường phát triển:

```env
MONGO_URL=<mongodb-atlas-uri>
JWT_SECRET=<random-secret>
REFRESH_JWT_SECRET=<different-random-secret>
PORT=8000
HOST=127.0.0.1
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CLOUD_NAME=<cloudinary-cloud-name>
API_KEY=<cloudinary-api-key>
API_SECRET=<cloudinary-api-secret>
```

## Các lệnh

```bash
yarn install
yarn test --runInBand
yarn dev
```

Môi trường triển khai chính thức được quản lý bằng systemd. Xem
[`../docs/wiki/operations.md`](../docs/wiki/operations.md) để cài đặt, kiểm tra
tình trạng hoạt động, xem nhật ký, khởi động lại và khôi phục phiên bản trước.
