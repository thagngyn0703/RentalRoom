# RentalRoom Operations Wiki

## Production status

| Item | Value |
| --- | --- |
| Public URL | `http://161.248.81.124` |
| Frontend | Nginx static build at `/var/www/rentalroom` |
| Backend | systemd `rentalroom-backend`, loopback port `8000` |
| Database | MongoDB Atlas database `WDP301` |
| Current state | Serving publicly; infrastructure/browser/stress checks passed, authenticated flow pending test credentials |
| Known risk | HTTP only; sensitive data is not transport-encrypted |

Không đổi trạng thái thành “pass” nếu database, public route, đăng nhập, test
hoặc browser audit chưa đạt.

## Required environment

Tạo `/etc/rentalroom/backend.env` từ
`deploy/env/backend.production.env.example`. File phải thuộc
`codexproxy:codexproxy`, mode `0600` và không có inline comment sau giá trị.

Các nhóm biến bắt buộc:

- Runtime: `NODE_ENV`, `PORT`, `HOST`, `FRONTEND_URL`.
- Database: `MONGO_URL`.
- Authentication: `JWT_SECRET`, `REFRESH_JWT_SECRET`, thời hạn token.
- Email: SMTP host, port, user, password và sender.
- Media/AI/shipping: Cloudinary, Gemini và GHN credentials.
- Payment display: bank account, code và display name.

Không ghi giá trị secrets vào Git, terminal transcript, log hoặc screenshot.

## Install or redeploy

```bash
cd /home/codexproxy/Codex-thangtts/RentalRoom/.worktrees/public-ip-production
sudo PROJECT_ROOT="$PWD" ENABLE_UFW=1 bash deploy/scripts/install-production.sh
```

Script kiểm tra environment file, cài Nginx/rsync nếu thiếu, cài dependency theo
Yarn lockfile, build frontend, publish static files, cài systemd/Nginx, giữ SSH
trong UFW, khởi động dịch vụ và chỉ kết thúc sau khi health/public/Socket.IO đạt.

## Status and health

```bash
sudo systemctl status rentalroom-backend nginx --no-pager
sudo systemctl is-enabled rentalroom-backend nginx
curl --fail http://127.0.0.1:8000/api/health
curl --fail http://127.0.0.1/api/health
curl --fail http://161.248.81.124/api/health
sudo ss -ltnp
```

Health chỉ trả `200` khi MongoDB connected; các trạng thái khác trả `503`.

## Restart and logs

```bash
sudo systemctl restart rentalroom-backend
sudo systemctl reload nginx
sudo journalctl -u rentalroom-backend --since "30 minutes ago" --no-pager
sudo tail -n 200 /var/log/nginx/error.log
sudo tail -n 200 /var/log/nginx/access.log
```

Không dán log chứa thông tin nhạy cảm vào issue công khai.

## Rebuild frontend

```bash
cd /home/codexproxy/Codex-thangtts/RentalRoom/.worktrees/public-ip-production/frontend
CI=true yarn test --watchAll=false
yarn build
sudo rsync -a --delete --chmod=D755,F644 build/ /var/www/rentalroom/
sudo chown -R root:root /var/www/rentalroom
sudo nginx -t
sudo systemctl reload nginx
```

## Rollback

1. Xác định commit tốt gần nhất bằng `git log --oneline`.
2. Tạo worktree mới tại đúng commit thay vì reset phá hủy worktree đang chạy.
3. Chạy test/build trong worktree rollback.
4. Sao lưu cấu hình Nginx và systemd hiện tại bằng tên file có timestamp.
5. Cài cấu hình/build từ worktree rollback, reload systemd/Nginx và restart backend.
6. Chạy `deploy/scripts/verify-production.sh`; chỉ chuyển traffic khi database connected.

Rollback không seed, migrate, xóa hoặc ghi lại dữ liệu Atlas.

## Secret rotation

Credentials đã xuất hiện trong hội thoại phải được coi là compromised. Trước
khi có người dùng thật:

1. Tạo MongoDB password mới và thu hồi password cũ.
2. Tạo hai JWT secrets ngẫu nhiên, độc lập.
3. Thu hồi/cấp lại Gemini key, Gmail app password, Cloudinary secret và token khác.
4. Cập nhật `/etc/rentalroom/backend.env` mà không in nội dung.
5. Restart backend, kiểm tra health, email, upload và login/logout.

## Verification policy

Vòng 1 kiểm tra test, build, syntax Nginx/systemd, service lifecycle, loopback
API/Socket.IO, Git và logs. Vòng 2 kiểm tra public path, bounded stress test và
Chromium thật ở `1440x900` cùng `390x844`, gồm console, network và responsive.

Ảnh desktop/mobile được giữ tối đa 24 giờ. Job xóa chỉ nhắm đúng hai đường dẫn
ảnh đã báo cáo; không dùng recursive delete hoặc glob rộng.

## Verification record — 2026-09-05 UTC

- Vòng 1: backend `21/21`, frontend `4/4`; production build exit `0`; Nginx,
  systemd, MongoDB health, loopback API và Socket.IO đạt.
- Vòng 2: public homepage/API/Socket.IO đạt; 200 request homepage và 200 request
  health ở concurrency 20 đều trả HTTP 200; Chromium thật kiểm tra `1440x900`
  và `390x844`, không thấy asset hỏng hoặc tràn ngang trên trang chủ.
- Review độc lập đã được xử lý: bỏ log header/body production, giới hạn CORS theo
  exact origin, render systemd theo checkout, thêm public health/Socket.IO vào
  verifier, chờ readiness khi install và khôi phục security headers Nginx.
- Chưa xác nhận E2E đăng nhập/thanh toán vì không có tài khoản test an toàn. Build
  vẫn có warning ESLint/dependency cũ; không được diễn giải trạng thái này là toàn
  bộ codebase sạch warning.

## Work tracking

- UI redesign preview: teal/forest shared theme; refreshed home, navigation,
  footer, room listings, auth, account/admin shells. Backend/API unchanged.
- Visual checks for protected pages use a browser-local fixture and intercept
  all API calls; they must not be reported as real authenticated transaction tests.
- On memory-constrained demo hosts, build with
  `GENERATE_SOURCEMAP=false NODE_OPTIONS=--max-old-space-size=1536 CI=false npm run build`.
  Keep the existing static site until the complete build succeeds, back it up,
  then copy the new assets. Git push still requires explicit target-branch approval.
- UI preview deployed on 2026-09-16 at `http://161.248.81.124/`; rollback static
  files are in `/var/backups/rentalroom-ui-20260916.24qLhM`. Backend unchanged.
- Verification: 10 frontend tests pass (`--watchAll=false --runInBand --forceExit`;
  legacy test/runtime warnings remain). Production build passes with existing
  lint/dependency warnings. Public pages checked at 1440/390px; account/admin
  visual fixture checks cover 26 routes at both sizes plus mobile drawer navigation.
  Comparison, chatbot open/close, and room-detail overflow regression checks
  cover 320/390/768/1024/1440px. No real payment/write transaction was tested.

- Đang làm: chờ tài khoản test để kiểm tra E2E authenticated/payment.
- UX-02: so sánh 2 phòng đã triển khai ở frontend; lựa chọn chỉ tồn tại trong
  phiên trang, giới hạn cứng 2 phòng, có thanh chọn và dialog responsive.
- Sắp làm: domain, trusted TLS, ép HTTPS, Secure cookies, rotation credentials,
  monitoring và backup ngoài máy chủ.
- Quy tắc bắt buộc: Git, Superpowers, planning, TDD, surgical changes, hai vòng
  audit/stress test, browser desktop/mobile và cập nhật README/wiki sau thay đổi.
