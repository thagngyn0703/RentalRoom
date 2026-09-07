# RentalRoom Backend

Express/Socket.IO backend sử dụng MongoDB Atlas, JWT refresh cookie, Cloudinary,
SMTP, Gemini, GHN và thông tin VietQR.

## Environment

Tạo `.env` cho development hoặc `/etc/rentalroom/backend.env` cho production.
Không commit file chứa secrets. Danh sách đầy đủ nằm tại
`../deploy/env/backend.production.env.example`.

Ví dụ development tối thiểu:

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

## Commands

```bash
yarn install
yarn test --runInBand
yarn dev
```

Production được quản lý bằng systemd. Xem
[`../docs/wiki/operations.md`](../docs/wiki/operations.md) để cài đặt, kiểm tra
health, xem log, restart và rollback.
