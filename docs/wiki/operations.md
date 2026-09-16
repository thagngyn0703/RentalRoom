# Wiki vận hành RentalRoom

## Trạng thái môi trường vận hành chính thức

| Hạng mục | Giá trị |
| --- | --- |
| URL công khai | `http://161.248.81.124` |
| Giao diện | Bản dựng tĩnh do Nginx phục vụ tại `/var/www/rentalroom` |
| Máy chủ ứng dụng | Dịch vụ systemd `rentalroom-backend`, cổng nội bộ `8000` |
| Cơ sở dữ liệu | Cơ sở dữ liệu MongoDB Atlas `WDP301` |
| Trạng thái hiện tại | Đang phục vụ công khai; kiểm tra hạ tầng/trình duyệt/tải đã đạt, luồng có xác thực đang chờ thông tin tài khoản kiểm thử |
| Rủi ro đã biết | Chỉ dùng HTTP; dữ liệu nhạy cảm không được mã hóa khi truyền |

Không đổi trạng thái thành “đạt” nếu cơ sở dữ liệu, đường truy cập công khai, đăng nhập,
kiểm thử hoặc kiểm tra trình duyệt chưa đạt.

## Yêu cầu về môi trường

Tạo `/etc/rentalroom/backend.env` từ
`deploy/env/backend.production.env.example`. Tệp phải thuộc
`codexproxy:codexproxy`, có quyền `0600` và không có chú thích cùng dòng sau giá trị.

Các nhóm biến bắt buộc:

- Môi trường chạy: `NODE_ENV`, `PORT`, `HOST`, `FRONTEND_URL`.
- Cơ sở dữ liệu: `MONGO_URL`.
- Xác thực: `JWT_SECRET`, `REFRESH_JWT_SECRET`, thời hạn mã thông báo.
- Thư điện tử: máy chủ SMTP, cổng, người dùng, mật khẩu và người gửi.
- Đa phương tiện/AI/vận chuyển: thông tin xác thực Cloudinary, Gemini và GHN.
- Hiển thị thanh toán: tài khoản ngân hàng, mã ngân hàng và tên hiển thị.

Không ghi giá trị bí mật vào Git, bản ghi thiết bị đầu cuối, nhật ký hoặc ảnh chụp màn hình.

## Cài đặt hoặc triển khai lại

```bash
cd /home/codexproxy/Codex-thangtts/RentalRoom/.worktrees/public-ip-production
sudo PROJECT_ROOT="$PWD" ENABLE_UFW=1 bash deploy/scripts/install-production.sh
```

Tập lệnh kiểm tra tệp môi trường, cài Nginx/rsync nếu thiếu, cài các gói phụ thuộc theo
tệp khóa Yarn, dựng giao diện, xuất bản tệp tĩnh, cài systemd/Nginx, giữ quyền truy cập SSH
trong UFW, khởi động dịch vụ và chỉ kết thúc sau khi kiểm tra tình trạng/truy cập công khai/Socket.IO đạt.

## Trạng thái và tình trạng hoạt động

```bash
sudo systemctl status rentalroom-backend nginx --no-pager
sudo systemctl is-enabled rentalroom-backend nginx
curl --fail http://127.0.0.1:8000/api/health
curl --fail http://127.0.0.1/api/health
curl --fail http://161.248.81.124/api/health
sudo ss -ltnp
```

Điểm kiểm tra tình trạng chỉ trả `200` khi MongoDB đã kết nối; các trạng thái khác trả `503`.

## Khởi động lại và nhật ký

```bash
sudo systemctl restart rentalroom-backend
sudo systemctl reload nginx
sudo journalctl -u rentalroom-backend --since "30 minutes ago" --no-pager
sudo tail -n 200 /var/log/nginx/error.log
sudo tail -n 200 /var/log/nginx/access.log
```

Không dán nhật ký chứa thông tin nhạy cảm vào báo cáo vấn đề công khai.

## Dựng lại giao diện

```bash
cd /home/codexproxy/Codex-thangtts/RentalRoom/.worktrees/public-ip-production/frontend
CI=true yarn test --watchAll=false
yarn build
sudo rsync -a --delete --chmod=D755,F644 build/ /var/www/rentalroom/
sudo chown -R root:root /var/www/rentalroom
sudo nginx -t
sudo systemctl reload nginx
```

## Khôi phục phiên bản trước

1. Xác định bản ghi thay đổi hoạt động tốt gần nhất bằng `git log --oneline`.
2. Tạo cây làm việc mới tại đúng bản ghi thay đổi thay vì đặt lại theo cách phá hủy cây làm việc đang chạy.
3. Chạy kiểm thử và dựng ứng dụng trong cây làm việc dùng để khôi phục.
4. Sao lưu cấu hình Nginx và systemd hiện tại bằng tên tệp có dấu thời gian.
5. Cài cấu hình/bản dựng từ cây làm việc dùng để khôi phục, nạp lại systemd/Nginx và khởi động lại máy chủ ứng dụng.
6. Chạy `deploy/scripts/verify-production.sh`; chỉ chuyển lưu lượng khi cơ sở dữ liệu đã kết nối.

Việc khôi phục không nạp dữ liệu mẫu, chuyển đổi cấu trúc, xóa hoặc ghi lại dữ liệu Atlas.

## Thay mới thông tin bí mật

Thông tin xác thực đã xuất hiện trong hội thoại phải được coi là đã bị lộ. Trước
khi có người dùng thật:

1. Tạo mật khẩu MongoDB mới và thu hồi mật khẩu cũ.
2. Tạo hai khóa bí mật JWT ngẫu nhiên, độc lập.
3. Thu hồi/cấp lại khóa Gemini, mật khẩu ứng dụng Gmail, khóa bí mật Cloudinary và các mã thông báo khác.
4. Cập nhật `/etc/rentalroom/backend.env` mà không in nội dung.
5. Khởi động lại máy chủ ứng dụng, kiểm tra tình trạng, thư điện tử, tải lên và đăng nhập/đăng xuất.

## Chính sách kiểm chứng

Vòng 1 kiểm tra các bài kiểm thử, bản dựng, cú pháp Nginx/systemd, vòng đời dịch vụ,
API/Socket.IO qua địa chỉ nội bộ, Git và nhật ký. Vòng 2 kiểm tra đường truy cập công khai,
kiểm thử tải có giới hạn và Chromium thật ở `1440x900` cùng `390x844`, gồm bảng điều khiển,
mạng và khả năng thích ứng với kích thước màn hình.

Ảnh máy tính/điện thoại được giữ tối đa 24 giờ. Tác vụ xóa chỉ nhắm đúng hai đường dẫn
ảnh đã báo cáo; không dùng cách xóa đệ quy hoặc mẫu ký tự đại diện có phạm vi rộng.

## Biên bản kiểm chứng — 2026-09-05 UTC

- Vòng 1: máy chủ ứng dụng `21/21`, giao diện `4/4`; bản dựng cho môi trường vận hành chính thức có mã thoát `0`;
  Nginx, systemd, tình trạng MongoDB, API qua địa chỉ nội bộ và Socket.IO đạt.
- Vòng 2: trang chủ/API/Socket.IO công khai đạt; 200 yêu cầu tới trang chủ và 200 yêu cầu
  kiểm tra tình trạng với 20 yêu cầu đồng thời đều trả HTTP 200; Chromium thật kiểm tra `1440x900`
  và `390x844`, không thấy tài nguyên hỏng hoặc tràn ngang trên trang chủ.
- Các góp ý rà soát độc lập đã được xử lý: bỏ ghi nhật ký phần đầu/nội dung yêu cầu trong môi trường vận hành chính thức,
  giới hạn CORS theo nguồn gốc khớp chính xác, tạo cấu hình systemd theo bản mã nguồn đang triển khai,
  thêm kiểm tra tình trạng/Socket.IO công khai vào bộ kiểm chứng, chờ trạng thái sẵn sàng khi cài đặt
  và khôi phục các tiêu đề bảo mật Nginx.
- Chưa xác nhận kiểm thử đầu cuối đăng nhập/thanh toán vì không có tài khoản kiểm thử an toàn. Bản dựng
  vẫn có cảnh báo ESLint/gói phụ thuộc cũ; không được diễn giải trạng thái này là toàn
  bộ mã nguồn không còn cảnh báo.

## Theo dõi công việc

- Tài liệu công khai tại `/docs`: điều hướng trên máy tính/điện thoại, 11 tệp Markdown,
  lựa chọn tài liệu qua `?file=` có thể chia sẻ và khả năng tải xuống tệp gốc. `prebuild` tạo
  dữ liệu cho trình đọc từ danh sách được chỉ định rõ trong `frontend/scripts/docs-manifest.json`.
  Thêm tài liệu công khai mới vào danh sách đó; tuyệt đối không đưa vào tệp môi trường hoặc tệp phục vụ lúc chạy.


- Bản xem trước giao diện thiết kế lại: chủ đề chung màu xanh ngọc/xanh rừng; làm mới trang chủ,
  điều hướng, chân trang, danh sách phòng, xác thực và khung trang tài khoản/quản trị. Máy chủ ứng dụng/API không đổi.
- Kiểm tra hình thức các trang được bảo vệ sử dụng dữ liệu giả lập cục bộ trong trình duyệt và chặn xử lý
  mọi lệnh gọi API; không được báo cáo chúng là kiểm thử giao dịch thực có xác thực.
- Trên máy chủ trình diễn có bộ nhớ hạn chế, dựng ứng dụng bằng
  `GENERATE_SOURCEMAP=false NODE_OPTIONS=--max-old-space-size=1536 CI=false npm run build`.
  Giữ nguyên trang tĩnh hiện có cho đến khi toàn bộ bản dựng thành công, sao lưu trang đó,
  rồi sao chép các tài nguyên mới. Việc đẩy lên Git vẫn yêu cầu phê duyệt rõ ràng nhánh đích.
- Bản xem trước giao diện được triển khai ngày 2026-09-16 tại `http://161.248.81.124/`; các tệp tĩnh
  dùng để khôi phục nằm trong `/var/backups/rentalroom-ui-20260916.24qLhM`. Máy chủ ứng dụng không đổi.
- Kiểm chứng: 10 bài kiểm thử giao diện đạt (`--watchAll=false --runInBand --forceExit`;
  vẫn còn cảnh báo cũ từ kiểm thử/môi trường chạy). Bản dựng cho môi trường vận hành chính thức đạt nhưng vẫn có
  các cảnh báo kiểm tra mã/gói phụ thuộc hiện hữu. Các trang công khai đã được kiểm tra ở 1440/390px;
  kiểm tra hình thức bằng dữ liệu giả lập cho tài khoản/quản trị bao phủ 26 đường dẫn ở cả hai kích thước,
  cùng điều hướng qua ngăn trượt trên điện thoại. Kiểm tra hồi quy cho tính năng so sánh, mở/đóng chatbot
  và lỗi tràn ở chi tiết phòng bao phủ 320/390/768/1024/1440px. Chưa kiểm thử giao dịch thanh toán/ghi dữ liệu thực.

- Đang làm: chờ tài khoản kiểm thử để kiểm tra đầu cuối các luồng có xác thực/thanh toán.
- UX-02: so sánh 2 phòng đã triển khai ở giao diện; lựa chọn chỉ tồn tại trong
  phiên trang, giới hạn cứng 2 phòng, có thanh chọn và hộp thoại thích ứng với kích thước màn hình.
- Sắp làm: tên miền, TLS được tin cậy, bắt buộc HTTPS, cookie có thuộc tính Secure, thay mới thông tin xác thực,
  giám sát và sao lưu ngoài máy chủ.
- Quy tắc bắt buộc: Git, Superpowers, lập kế hoạch, phát triển hướng kiểm thử (TDD), thay đổi đúng phạm vi cần thiết,
  hai vòng rà soát/kiểm thử tải, kiểm tra trình duyệt trên máy tính/điện thoại và cập nhật README/wiki sau thay đổi.
