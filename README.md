# RentalRoom (Trọ Chung)

RentalRoom là nền tảng quản lý và tìm phòng trọ gồm đăng tin, tìm kiếm và so sánh
2 phòng, đặt phòng, thanh toán chuyển khoản/VietQR, ví, gia hạn, trả phòng, trò chuyện thời gian
thực, thông báo và quản trị người dùng.

## Kiến trúc

- `frontend/`: React 18, Redux Toolkit, Material UI và Socket.IO phía trình duyệt.
- `backend/`: Express, Socket.IO, Mongoose, MongoDB Atlas và tích hợp email/Cloudinary.
- `deploy/`: cấu hình Nginx, systemd, biến môi trường mẫu và tập lệnh vận hành.
- `docs/wiki/operations.md`: tài liệu triển khai và vận hành môi trường chính thức.

UX-02 hiện hỗ trợ chọn tối đa 2 phòng ngay trong danh sách `/rooms`, xem bảng
đối chiếu trên máy tính và thẻ đối chiếu dọc trên điện thoại.

Luồng triển khai chính thức là trình duyệt → Nginx cổng 80 → giao diện tĩnh hoặc phần máy chủ
chỉ lắng nghe nội bộ tại `127.0.0.1:8000`. API và Socket.IO dùng cùng nguồn truy cập.

## Trạng thái

- Tối ưu tải trang: tách mã theo tuyến, nén gzip cho JS/CSS/JSON, tải trễ ảnh thẻ
  phòng và dùng ảnh Cloudinary 640 px. Trang chủ gọi dữ liệu tóm tắt thay vì
  tải tối đa 5.000 bản ghi về trình duyệt và gọi riêng từng khu vực.
  Giữ nguyên quy tắc hiển thị, xếp hạng và đếm phòng; chưa commit/push bản tối ưu.

- Bản giao diện thử nghiệm mới dùng màu xanh ngọc/xanh rừng, nền trắng ngà, ảnh minh họa nội thất
  nhẹ và hệ thống MUI chung cho trang công khai, tài khoản và quản trị.
- Trang chủ, điều hướng, chân trang, danh sách phòng, biểu mẫu xác thực và khung
  quản lý được làm mới; khu vực quản trị/tài khoản có trình đơn trên điện thoại. Không đổi API nghiệp vụ.
- Bản giao diện đã được người dùng xem bản thử nghiệm và yêu cầu đưa lên nhánh `main`.
  Kiểm tra trang yêu cầu đăng nhập bằng dữ liệu giả lập chỉ xác nhận giao diện,
  không thay thế kiểm thử giao dịch bằng tài khoản thật.

- Địa chỉ công khai dự kiến: `http://161.248.81.124`.
- Trạng thái: đang phục vụ qua Nginx/systemd; kiểm tra truy cập công khai, trình duyệt và tải đồng thời
  đã đạt, còn chờ tài khoản kiểm thử để xác nhận trọn luồng đăng nhập/thanh toán.
- Giới hạn: chưa có tên miền/TLS; HTTP không an toàn cho dữ liệu nhạy cảm.
- Tiếp theo: kiểm thử luồng yêu cầu đăng nhập bằng tài khoản kiểm thử, xử lý cảnh báo kỹ
  thuật hiện hữu, trỏ tên miền, bật HTTPS và thay mới toàn bộ thông tin xác thực đã lộ.

Chi tiết nằm trong [tài liệu vận hành](docs/wiki/operations.md).

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

Không đưa `.env` vào Git. Dùng [cấu hình biến môi trường mẫu](deploy/env/backend.production.env.example)
để biết tên biến bắt buộc.

## Quy tắc dự án

- Mọi thay đổi phải được quản lý bằng Git, giữ phạm vi nhỏ và tránh tái cấu trúc mã
  ngoài yêu cầu.
- Trước khi viết mã/rà soát/gỡ lỗi/triển khai phải dùng hướng dẫn Superpowers phù hợp;
  tính năng và sửa lỗi phải có bước lập kế hoạch, phát triển hướng kiểm thử (TDD) và sửa đúng phạm vi.
- `DESIGN.md` là nguồn nhận diện giao diện nếu có. Thay đổi giao diện đáng kể phải tạo
  hoặc cập nhật tệp này trước khi sửa giao diện.
- Không báo đạt dựa trên phỏng đoán. Mọi bản triển khai phải kiểm tra, rà soát và
  kiểm thử tải qua hai vòng với bằng chứng mới.
- Bắt buộc kiểm thử trình duyệt thật trên máy tính và điện thoại, kiểm tra bảng điều khiển,
  yêu cầu mạng, khả năng thích ứng kích thước màn hình và trạng thái đang tải, trống, lỗi.
- Ảnh xác nhận phải được liên kết trong báo cáo và xóa sau 24 giờ bằng tác vụ chỉ
  định danh đúng từng tệp.
- README và tài liệu vận hành phải cập nhật chức năng, trạng thái đang làm và việc tiếp theo
  sau mỗi hệ thống hoặc tính năng.

## Tài liệu

Trang công khai `/docs` (mục **Tài liệu** trên thanh điều hướng trên máy tính/điện thoại) tập hợp
11 tài liệu, hỗ trợ đọc Markdown, tải bản gốc và chia sẻ URL từng tệp.
Nội dung được đồng bộ từ tệp nguồn khi chạy các lệnh `start`/`dev`/`build`; danh mục công khai
được khai báo tại `frontend/scripts/docs-manifest.json`.


- [Hướng dẫn phần máy chủ](backend/README.md)
- [Hướng dẫn phần giao diện](frontend/README.md)
- [Tài liệu vận hành](docs/wiki/operations.md)
- [Thiết kế triển khai](docs/superpowers/specs/2026-09-05-public-ip-production-deployment-design.md)
- [Kế hoạch thực hiện](docs/superpowers/plans/2026-09-05-public-ip-production-deployment.md)
