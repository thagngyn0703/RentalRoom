# RentalRoom (Trọ Chung)

RentalRoom là nền tảng quản lý và tìm phòng trọ gồm đăng tin, tìm kiếm và so sánh
2 phòng, đặt phòng, thanh toán chuyển khoản/VietQR, ví, gia hạn, trả phòng, chat thời gian
thực, thông báo và quản trị người dùng.

## Kiến trúc

- `frontend/`: React 18, Redux Toolkit, Material UI và Socket.IO client.
- `backend/`: Express, Socket.IO, Mongoose, MongoDB Atlas và tích hợp email/Cloudinary.
- `deploy/`: cấu hình Nginx, systemd, environment mẫu và script vận hành.
- `docs/wiki/operations.md`: wiki triển khai và vận hành production.

UX-02 hiện hỗ trợ chọn tối đa 2 phòng ngay trong danh sách `/rooms`, xem bảng
đối chiếu trên desktop và card đối chiếu dọc trên mobile.

Luồng production là trình duyệt → Nginx cổng 80 → frontend tĩnh hoặc backend
loopback `127.0.0.1:8000`. API và Socket.IO dùng cùng origin.

## Trạng thái

- Mục tiêu public: `http://161.248.81.124`.
- Trạng thái: đang phục vụ qua Nginx/systemd; kiểm chứng public, browser và stress
  đã đạt, còn chờ tài khoản test để xác nhận trọn luồng đăng nhập/thanh toán.
- Giới hạn: chưa có domain/TLS; HTTP không an toàn cho dữ liệu nhạy cảm.
- Tiếp theo: kiểm thử luồng authenticated bằng tài khoản test, xử lý warning kỹ
  thuật hiện hữu, trỏ domain, bật HTTPS và xoay toàn bộ credentials đã lộ.

Chi tiết nằm trong [operations wiki](docs/wiki/operations.md).

## Phát triển

```bash
cd backend
yarn install
yarn test --runInBand
yarn start
```

```bash
cd frontend
yarn install
CI=true yarn test --watchAll=false
yarn build
```

Không commit `.env`. Dùng [environment mẫu](deploy/env/backend.production.env.example)
để biết tên biến bắt buộc.

## Quy tắc dự án

- Mọi thay đổi phải được quản lý bằng Git, giữ phạm vi nhỏ và tránh refactor
  ngoài yêu cầu.
- Trước khi code/review/debug/deploy phải dùng hướng dẫn Superpowers phù hợp;
  tính năng và bugfix phải theo planning, TDD và thay đổi surgical.
- `DESIGN.md` là nguồn nhận diện giao diện nếu có. Thay đổi UI đáng kể phải tạo
  hoặc cập nhật file này trước khi sửa giao diện.
- Không báo pass dựa trên phỏng đoán. Mọi bản triển khai phải audit, review và
  stress test hai vòng bằng bằng chứng mới.
- Bắt buộc test trình duyệt thật ở desktop và mobile, kiểm tra console/network,
  responsive, loading, empty và error states.
- Ảnh xác nhận phải được liên kết trong báo cáo và xóa sau 24 giờ bằng job chỉ
  định danh đúng từng file.
- README và wiki phải cập nhật chức năng, trạng thái đang làm và việc tiếp theo
  sau mỗi hệ thống hoặc tính năng.

## Tài liệu

- [Backend setup](backend/README.md)
- [Frontend setup](frontend/README.md)
- [Operations wiki](docs/wiki/operations.md)
- [Deployment design](docs/superpowers/specs/2026-09-05-public-ip-production-deployment-design.md)
- [Implementation plan](docs/superpowers/plans/2026-09-05-public-ip-production-deployment.md)
