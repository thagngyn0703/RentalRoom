# Kế hoạch triển khai môi trường vận hành chính thức qua IP công khai

> **Dành cho các tác nhân thực hiện:** KỸ NĂNG CON BẮT BUỘC: Sử dụng superpowers:subagent-driven-development (khuyến nghị) hoặc superpowers:executing-plans để thực hiện lần lượt từng công việc trong kế hoạch này. Các bước sử dụng cú pháp ô đánh dấu (`- [ ]`) để theo dõi.

**Mục tiêu:** Vận hành RentalRoom liên tục tại `http://161.248.81.124` bằng Nginx, dịch vụ backend do systemd quản lý và chỉ lắng nghe trên địa chỉ loopback, báo cáo trạng thái sẵn sàng của MongoDB Atlas và tài liệu vận hành.

**Kiến trúc:** Nginx phục vụ ứng dụng React đã biên dịch và chuyển tiếp lưu lượng API cùng Socket.IO có cùng nguồn đến Express tại `127.0.0.1:8000`. Các thay đổi trong ứng dụng giúp URL cơ sở của API dùng cùng nguồn với trình duyệt, xác định chế độ bảo mật cookie theo giao thức thực tế của yêu cầu, cung cấp trạng thái sẵn sàng của cơ sở dữ liệu và tuân theo địa chỉ loopback được cấu hình để lắng nghe. Thông tin bí mật được lưu ngoài Git trong tệp môi trường có quyền `0600`.

**Công nghệ sử dụng:** React 18/Create React App, Axios, Express 5, Socket.IO 4, Mongoose 7, Jest, Nginx, systemd, Ubuntu UFW, Chromium.

**Đặc tả:** `docs/superpowers/specs/2026-09-05-public-ip-production-deployment-design.md`

## Ràng buộc chung

- URL công khai phải là chính xác `http://161.248.81.124` cho đến khi có tên miền.
- Cổng ứng dụng công khai là `80/tcp`; cổng backend `8000/tcp` chỉ lắng nghe trên địa chỉ loopback.
- Không được nạp dữ liệu mẫu, di chuyển, xóa hoặc ghi lại dữ liệu hiện có trên MongoDB Atlas.
- Tuyệt đối không đưa giá trị bí mật vào Git, tệp dịch vụ, tệp Nginx, nhật ký, ảnh chụp màn hình hoặc báo cáo.
- Không đưa những thay đổi có sẵn nhưng không liên quan trong `yarn.lock` và các tệp `screenshots/` vào các bản commit triển khai.
- Mọi thay đổi hành vi đều tuân theo TDD với chu trình kiểm thử thất bại rồi thành công (đỏ–xanh).
- Chỉ hoàn tất sau hai vòng xác minh mới và kiểm tra thực tế bằng Chromium ở kích thước `1440x900` và `390x844`.
- Bản triển khai HTTP hiện tại được xác định rõ là tạm thời và không an toàn cho lưu lượng chứa thông tin nhạy cảm thực tế.

---

### Công việc 1: Giao tiếp frontend cùng nguồn

**Tệp:**
- Tạo: `frontend/src/config/apiBaseUrl.js`
- Tạo: `frontend/src/config/apiBaseUrl.test.js`
- Xóa: `frontend/src/App.test.js` (tệp mẫu Create React App đã lỗi thời)
- Sửa: `frontend/src/config/axios.js`
- Sửa: `frontend/src/config/axiosJWT.js`

**Giao diện:**
- Cung cấp: `resolveApiBaseUrl(value?: string): string`, trả về URL được chỉ định sau khi loại bỏ khoảng trắng ở hai đầu hoặc `''` để dùng cùng nguồn.
- Sử dụng: `process.env.REACT_APP_API_URL` của Create React App.

- [ ] **Bước 1: Viết kiểm thử thất bại cho hàm xác định URL**

```js
import { resolveApiBaseUrl } from './apiBaseUrl';

test('uses the browser origin when no API URL is configured', () => {
  expect(resolveApiBaseUrl(undefined)).toBe('');
  expect(resolveApiBaseUrl('   ')).toBe('');
});

test('trims an explicitly configured API URL', () => {
  expect(resolveApiBaseUrl(' http://127.0.0.1:8000/ ')).toBe('http://127.0.0.1:8000/');
});
```

- [ ] **Bước 2: Chạy kiểm thử ở pha ĐỎ**

Chạy: `cd frontend && CI=true yarn test --watchAll=false src/config/apiBaseUrl.test.js`

Kết quả mong đợi: THẤT BẠI vì `./apiBaseUrl` chưa tồn tại.

- [ ] **Bước 3: Cài đặt hàm xác định URL tối thiểu**

```js
export const resolveApiBaseUrl = (value) => (value || '').trim();
```

Cập nhật cả hai tệp cấu hình Axios để nhập hàm xác định URL và thiết lập URL cơ sở từ:

```js
const API_BASE_URL = resolveApiBaseUrl(process.env.REACT_APP_API_URL);
```

Loại bỏ URL Render dự phòng đã lỗi thời và nhánh xử lý dành cho môi trường phát triển.

Xóa `frontend/src/App.test.js`: tệp này kiểm tra sự hiện diện của dòng chữ mẫu
"learn react" trong Create React App vốn đã bị xóa, nên không kiểm thử hành vi
hiện tại của sản phẩm. Không thay bằng một phép kiểm tra hời hợt; kiểm thử mới
cho hàm xác định URL là kiểm thử hồi quy được duy trì cho cơ chế giao tiếp trong công việc này.

- [ ] **Bước 4: Chạy kiểm thử ở pha XANH và toàn bộ kiểm thử frontend**

Chạy: `cd frontend && CI=true yarn test --watchAll=false src/config/apiBaseUrl.test.js`

Kết quả mong đợi: 2 kiểm thử thành công.

Chạy: `cd frontend && CI=true yarn test --watchAll=false`

Kết quả mong đợi: tất cả kiểm thử đang được duy trì đều thành công và không còn phép kiểm tra mẫu khởi tạo đã lỗi thời.

- [ ] **Bước 5: Tạo commit**

```bash
git add frontend/src/App.test.js frontend/src/config/apiBaseUrl.js frontend/src/config/apiBaseUrl.test.js frontend/src/config/axios.js frontend/src/config/axiosJWT.js
git commit -m "fix: use same-origin API in production"
```

### Công việc 2: Cookie xác thực phù hợp với giao thức

**Tệp:**
- Tạo: `backend/utils/cookieOptions.js`
- Tạo: `backend/test/cookieOptions.test.js`
- Sửa: `backend/controllers/authControllers.js`

**Giao diện:**
- Cung cấp: `isHttpsRequest(req): boolean`.
- Cung cấp: `refreshCookieOptions(req, overrides?): object` với `httpOnly`, `path`, `secure`, `sameSite` và các giá trị ghi đè tùy chọn.
- Sử dụng: giao thức yêu cầu của Express và `X-Forwarded-Proto` do Nginx thiết lập.

- [ ] **Bước 1: Viết các kiểm thử thất bại cho chính sách cookie**

```js
const { refreshCookieOptions } = require('../utils/cookieOptions');

test('uses Lax non-Secure cookie for an HTTP request in production', () => {
  const options = refreshCookieOptions({ secure: false, headers: {} });
  expect(options).toMatchObject({ httpOnly: true, secure: false, sameSite: 'lax', path: '/' });
});

test('uses None Secure cookie behind an HTTPS proxy', () => {
  const options = refreshCookieOptions({ secure: false, headers: { 'x-forwarded-proto': 'https' } });
  expect(options).toMatchObject({ secure: true, sameSite: 'none' });
});
```

- [ ] **Bước 2: Chạy kiểm thử ở pha ĐỎ**

Chạy: `cd backend && yarn test --runInBand test/cookieOptions.test.js`

Kết quả mong đợi: THẤT BẠI vì `cookieOptions` chưa tồn tại.

- [ ] **Bước 3: Cài đặt và tái sử dụng chính sách cookie**

```js
const isHttpsRequest = (req) => {
  const forwarded = req.headers?.['x-forwarded-proto'] || '';
  return Boolean(req.secure || forwarded.split(',').some((value) => value.trim() === 'https'));
};

const refreshCookieOptions = (req, overrides = {}) => {
  const secure = isHttpsRequest(req);
  return { httpOnly: true, path: '/', secure, sameSite: secure ? 'none' : 'lax', ...overrides };
};

module.exports = { isHttpsRequest, refreshCookieOptions };
```

Thay thế phần tạo tùy chọn cookie bị lặp trong các hàm xử lý đăng nhập, đăng xuất và làm mới token. Giữ nguyên thời gian tồn tại tối đa, hành vi hết hạn và tên miền cookie tùy chọn hiện tại.

- [ ] **Bước 4: Chạy kiểm thử ở pha XANH và các kiểm thử backend**

Chạy: `cd backend && yarn test --runInBand test/cookieOptions.test.js`

Kết quả mong đợi: 2 kiểm thử thành công.

Chạy: `cd backend && yarn test --runInBand`

Kết quả mong đợi: toàn bộ bộ kiểm thử backend thành công.

- [ ] **Bước 5: Tạo commit**

```bash
git add backend/utils/cookieOptions.js backend/test/cookieOptions.test.js backend/controllers/authControllers.js
git commit -m "fix: derive auth cookie security from request protocol"
```

### Công việc 3: Điểm cuối trạng thái sẵn sàng và lắng nghe trên địa chỉ loopback

**Tệp:**
- Tạo: `backend/utils/runtimeStatus.js`
- Tạo: `backend/test/runtimeStatus.test.js`
- Sửa: `backend/server.js`

**Giao diện:**
- Cung cấp: `getHealth(connectionState): { statusCode: number, body: object }`.
- Cung cấp: `resolveListenHost(value?: string): string`, trả về địa chỉ máy chủ được chỉ định hoặc `0.0.0.0`.
- Cung cấp điểm cuối: `GET /api/health` trả về `200` với `status: "ok"` khi trạng thái Mongoose là `1`; ngược lại trả về `503` với `status: "not_ready"`.

- [ ] **Bước 1: Viết các kiểm thử thất bại cho trạng thái vận hành**

```js
const { getHealth, resolveListenHost } = require('../utils/runtimeStatus');

test('reports ready only when MongoDB is connected', () => {
  expect(getHealth(1)).toEqual({ statusCode: 200, body: { status: 'ok', database: 'connected' } });
  expect(getHealth(0)).toEqual({ statusCode: 503, body: { status: 'not_ready', database: 'disconnected' } });
  expect(getHealth(2)).toEqual({ statusCode: 503, body: { status: 'not_ready', database: 'connecting' } });
  expect(getHealth(3)).toEqual({ statusCode: 503, body: { status: 'not_ready', database: 'disconnecting' } });
});

test('defaults to all interfaces but accepts a loopback override', () => {
  expect(resolveListenHost(undefined)).toBe('0.0.0.0');
  expect(resolveListenHost(' 127.0.0.1 ')).toBe('127.0.0.1');
});
```

- [ ] **Bước 2: Chạy kiểm thử ở pha ĐỎ**

Chạy: `cd backend && yarn test --runInBand test/runtimeStatus.test.js`

Kết quả mong đợi: THẤT BẠI vì `runtimeStatus` chưa tồn tại.

- [ ] **Bước 3: Cài đặt các hàm hỗ trợ trạng thái và điểm cuối**

Cài đặt chính xác ánh xạ trạng thái `0 -> disconnected`, `1 -> connected`,
`2 -> connecting` và `3 -> disconnecting`, không đưa URI, thông tin xác thực,
dấu vết ngăn xếp hoặc chi tiết máy chủ vào phản hồi. Mọi trạng thái không xác định
được ánh xạ thành `unknown` với mã trạng thái `503`. Thêm `/api/health` trước các bộ định tuyến ứng dụng:

```js
app.get('/api/health', (req, res) => {
  const health = getHealth(mongoose.connection.readyState);
  return res.status(health.statusCode).json(health.body);
});
```

Thay đổi phần lắng nghe cuối cùng để sử dụng:

```js
const HOST = resolveListenHost(process.env.HOST);
httpServer.listen(PORT, HOST, () => console.log(`Server listening on ${HOST}:${PORT}`));
```

- [ ] **Bước 4: Chạy kiểm thử ở pha XANH và toàn bộ bộ kiểm thử backend**

Chạy: `cd backend && yarn test --runInBand test/runtimeStatus.test.js`

Kết quả mong đợi: 2 kiểm thử thành công.

Chạy: `cd backend && yarn test --runInBand`

Kết quả mong đợi: toàn bộ bộ kiểm thử thành công.

- [ ] **Bước 5: Tạo commit**

```bash
git add backend/utils/runtimeStatus.js backend/test/runtimeStatus.test.js backend/server.js
git commit -m "feat: expose backend readiness status"
```

### Công việc 4: Cấu hình triển khai được quản lý phiên bản

**Tệp:**
- Tạo: `deploy/nginx/rentalroom.conf`
- Tạo: `deploy/systemd/rentalroom-backend.service`
- Tạo: `deploy/env/backend.production.env.example`
- Tạo: `deploy/scripts/install-production.sh`
- Tạo: `deploy/scripts/verify-production.sh`

**Giao diện:**
- Nginx phục vụ `/var/www/rentalroom` và chuyển tiếp yêu cầu đến `http://127.0.0.1:8000`.
- systemd nạp `/etc/rentalroom/backend.env` và chạy `/usr/bin/node server.js` từ thư mục backend của kho mã.
- Tập lệnh cài đặt nhận `PROJECT_ROOT`; giá trị mặc định là thư mục gốc của kho mã hiện tại sau khi xác thực đường dẫn.

- [ ] **Bước 1: Tạo kiểm thử thất bại cho cấu hình tĩnh**

Chạy trước khi các tệp tồn tại:

```bash
test -f deploy/nginx/rentalroom.conf \
  && test -f deploy/systemd/rentalroom-backend.service \
  && test -f deploy/scripts/install-production.sh
```

Kết quả mong đợi: mã thoát khác 0.

- [ ] **Bước 2: Thêm mẫu cấu hình Nginx và systemd**

Yêu cầu đối với Nginx:

```nginx
server {
    listen 80 default_server;
    server_name 161.248.81.124 _;
    root /var/www/rentalroom;
    index index.html;
    client_max_body_size 25m;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 65s;
    }

    location ~ /\. { deny all; }
    location = /index.html { add_header Cache-Control "no-store"; }
    location / { try_files $uri $uri/ /index.html; }
}
```

Đơn vị dịch vụ systemd sử dụng `User=codexproxy`, `Group=codexproxy`, `EnvironmentFile=/etc/rentalroom/backend.env`, `Restart=on-failure`, `RestartSec=5`, `NoNewPrivileges=true`, `PrivateTmp=true` và `WantedBy=multi-user.target`.

- [ ] **Bước 3: Thêm tập lệnh cài đặt có thể chạy lặp lại an toàn và tập lệnh xác minh**

Tập lệnh cài đặt phải sử dụng `set -euo pipefail`; xác minh `backend/server.js` và `frontend/package.json` tồn tại; chỉ cài Nginx nếu chưa có; biên dịch frontend; đồng bộ kết quả biên dịch vào `/var/www/rentalroom`; cài đặt các tệp Nginx/systemd được quản lý phiên bản; chạy `nginx -t`; nạp lại cấu hình systemd; bật tự khởi động và khởi động lại cả hai dịch vụ; bảo đảm UFW cho phép SSH trước khi tùy chọn bật tường lửa; tuyệt đối không tạo hoặc in nội dung tệp môi trường chứa bí mật.

Tập lệnh xác minh phải sử dụng `curl --fail --show-error` với `/`, `/api/health` và backend qua địa chỉ loopback; kiểm tra trạng thái đang chạy và tự khởi động của systemd; chạy `nginx -t`; trả về mã khác 0 khi có bất kỳ lỗi nào.

- [ ] **Bước 4: Xác thực cấu hình mà không cài đặt**

Chạy:

```bash
bash -n deploy/scripts/install-production.sh
bash -n deploy/scripts/verify-production.sh
systemd-analyze verify deploy/systemd/rentalroom-backend.service
test -f deploy/nginx/rentalroom.conf && test -f deploy/systemd/rentalroom-backend.service
```

Kết quả mong đợi: mọi lệnh đều thoát với mã `0`. Chạy `nginx -t` sau khi cài Nginx trong Công việc 6.

- [ ] **Bước 5: Tạo commit**

```bash
git add deploy
git commit -m "ops: add production deployment configuration"
```

### Công việc 5: README sản phẩm và wiki vận hành

**Tệp:**
- Tạo: `README.md`
- Tạo: `docs/wiki/operations.md`
- Sửa: `backend/README.md`

**Giao diện:**
- README ở thư mục gốc liên kết đến thiết kế, kế hoạch, hướng dẫn backend, hướng dẫn frontend và wiki vận hành.
- Wiki vận hành là tài liệu quy trình chuẩn cho việc xem trạng thái, nhật ký, khởi động lại, triển khai, khôi phục phiên bản trước, quản lý bí mật và lộ trình.

- [ ] **Bước 1: Tạo các kiểm tra thất bại cho tài liệu**

Chạy:

```bash
test -f README.md && test -f docs/wiki/operations.md
```

Kết quả mong đợi: mã thoát khác 0.

- [ ] **Bước 2: Viết README và wiki**

Ghi lại các nội dung:

- chức năng sản phẩm và kiến trúc frontend/backend;
- trạng thái triển khai và URL công khai;
- các lệnh chính xác để cài đặt, xem trạng thái, khởi động lại, xem nhật ký, kiểm tra sức khỏe, biên dịch lại và khôi phục phiên bản trước;
- tên tất cả biến môi trường bắt buộc, chỉ kèm giá trị mẫu;
- công việc hiện tại, công việc tiếp theo, hạn chế bảo mật HTTP và việc thay mới thông tin xác thực;
- yêu cầu bắt buộc về quản lý Git, quy trình Superpowers, thay đổi có phạm vi hẹp và chính xác, TDD, hai vòng rà soát, kiểm tra trình duyệt máy tính/di động, bằng chứng ảnh chụp màn hình và chính sách xóa ảnh sau 24 giờ.

Sửa `backend/README.md` để sử dụng `REFRESH_JWT_SECRET`, các ví dụ chứa giá trị mẫu an toàn cho môi trường vận hành chính thức và các lệnh Yarn phù hợp với kho mã.

- [ ] **Bước 3: Kiểm tra tài liệu để phát hiện rò rỉ bí mật và liên kết nội bộ bị hỏng**

Chạy:

```bash
rg -n 'mongodb\+srv://[^:]+:[^@]+@|AIza[0-9A-Za-z_-]{20,}|SMTP_PASS=[^<]|API_SECRET=[^<]' README.md backend/README.md docs/wiki docs/superpowers/specs && exit 1 || true
test -f docs/wiki/operations.md
test -f docs/superpowers/specs/2026-09-05-public-ip-production-deployment-design.md
test -f docs/superpowers/plans/2026-09-05-public-ip-production-deployment.md
```

Kết quả mong đợi: không phát hiện mẫu bí mật nào và tất cả tệp nội bộ được liên kết đều tồn tại.

- [ ] **Bước 4: Tạo commit**

```bash
git add README.md backend/README.md docs/wiki/operations.md
git commit -m "docs: add product and production operations guide"
```

### Công việc 6: Cài đặt dịch vụ vận hành và thông tin bí mật

**Tệp nằm ngoài Git:**
- Tạo: `/etc/rentalroom/backend.env` với chủ sở hữu `codexproxy:codexproxy`, quyền `0600`.
- Cài đặt: `/etc/nginx/sites-available/rentalroom`.
- Cài đặt: `/etc/systemd/system/rentalroom-backend.service`.
- Xuất bản: `/var/www/rentalroom/`.

**Giao diện:**
- Môi trường backend bao gồm các giá trị đã được cung cấp cùng với `NODE_ENV=production`, `PORT=8000`, `HOST=127.0.0.1` và `FRONTEND_URL=http://161.248.81.124`.

- [ ] **Bước 1: Tạo tệp môi trường mà không in nội dung**

Sử dụng `sudo install -d -m 0750 -o codexproxy -g codexproxy /etc/rentalroom`, tạo tệp bằng `apply_patch` tại một đường dẫn tạm riêng tư, cài đặt bằng `sudo install -m 0600 -o codexproxy -g codexproxy`, rồi xóa ngay bản sao tạm. Không thêm chú thích cùng dòng sau các giá trị.

- [ ] **Bước 2: Chứng minh bí mật không được đưa vào Git**

Chạy `git status --short` và `git grep -n` để tìm các đoạn đặc trưng của từng bí mật đã được cung cấp.

Kết quả mong đợi: không có bí mật nào xuất hiện trong nội dung đang được theo dõi hoặc đã được đưa vào vùng chờ commit.

- [ ] **Bước 3: Cho phép truy cập Atlas và kiểm tra kết nối**

Thử khởi động backend với tệp môi trường đã được bảo vệ và chỉ kiểm tra đầu ra kết nối đã loại bỏ thông tin nhạy cảm. Nếu Atlas trả về lỗi danh sách IP được phép, báo rằng cần thêm `161.248.81.124/32` vào Atlas rồi dừng lại; không thay thế Atlas hoặc chỉnh sửa dữ liệu.

- [ ] **Bước 4: Chạy tập lệnh cài đặt**

Chạy: `sudo PROJECT_ROOT="$PWD" bash deploy/scripts/install-production.sh`

Kết quả mong đợi: biên dịch frontend thành công; cú pháp Nginx hợp lệ; backend và Nginx đang chạy và được bật tự khởi động.

- [ ] **Bước 5: Xác minh các cổng được mở và quyền sở hữu dịch vụ**

Chạy:

```bash
ss -ltnp | rg ':80|:8000'
sudo systemctl is-active rentalroom-backend nginx
sudo systemctl is-enabled rentalroom-backend nginx
stat -c '%U:%G %a %n' /etc/rentalroom/backend.env
```

Kết quả mong đợi: Nginx lắng nghe công khai trên cổng `80`; backend chỉ lắng nghe tại `127.0.0.1:8000`; các dịch vụ đang chạy và được bật tự khởi động; chủ sở hữu và quyền của tệp môi trường là `codexproxy:codexproxy 600`.

### Công việc 7: Vòng xác minh 1 — rà soát bản biên dịch và dịch vụ

**Tệp:**
- Không thay đổi mã nguồn trừ khi một kiểm tra thất bại phát hiện lỗi đã được chẩn đoán riêng.

- [ ] **Bước 1: Chạy đầy đủ các kiểm tra tự động**

```bash
cd backend && yarn test --runInBand
cd ../frontend && CI=true yarn test --watchAll=false
yarn build
cd .. && bash -n deploy/scripts/*.sh
sudo nginx -t
sudo systemctl is-active rentalroom-backend nginx
sudo systemctl is-enabled rentalroom-backend nginx
```

Kết quả mong đợi: tất cả lệnh đều thoát với mã `0`, không có kiểm thử thất bại.

- [ ] **Bước 2: Kiểm tra từng điểm giao tiếp giữa các thành phần cục bộ**

```bash
curl --fail --show-error http://127.0.0.1:8000/api/health
curl --fail --show-error http://127.0.0.1/api/health
curl --fail --show-error http://127.0.0.1/
curl --fail --show-error 'http://127.0.0.1/socket.io/?EIO=4&transport=polling'
```

Kết quả mong đợi: điểm cuối sức khỏe trả về `200` và cơ sở dữ liệu có trạng thái `connected`; trang chủ chứa phần tử gốc React; Socket.IO trả về gói mở kết nối Engine.IO.

- [ ] **Bước 3: Khởi động lại và kiểm tra lại**

Chạy: `sudo systemctl restart rentalroom-backend nginx && deploy/scripts/verify-production.sh`

Kết quả mong đợi: khởi động lại hoàn tất và tất cả phép kiểm tra đều thành công mà không cần can thiệp thủ công.

- [ ] **Bước 4: Rà soát Git và nhật ký**

Chạy `git diff --check`, `git status --short`, quét các mẫu bí mật và `sudo journalctl -u rentalroom-backend --since '10 minutes ago' --no-pager`.

Kết quả mong đợi: không có bí mật trong Git, không có thay đổi mã nguồn ngoài kế hoạch, không có lỗi kết nối MongoDB, ngoại lệ chưa được xử lý hoặc vòng lặp khởi động lại.

### Công việc 8: Vòng xác minh 2 — rà soát truy cập công khai, tải và trình duyệt

**Tệp:**
- Tạo tạm thời: `screenshots/production-desktop.png`
- Tạo tạm thời: `screenshots/production-mobile.png`

- [ ] **Bước 1: Kiểm tra đường truy cập công khai**

Chạy:

```bash
curl --fail --show-error --max-time 15 http://161.248.81.124/
curl --fail --show-error --max-time 15 http://161.248.81.124/api/health
curl --fail --show-error --max-time 15 'http://161.248.81.124/socket.io/?EIO=4&transport=polling'
```

Kết quả mong đợi: trang chủ, điểm cuối sức khỏe báo cơ sở dữ liệu sẵn sàng và quá trình bắt tay Socket.IO đều hoạt động thành công qua Nginx.

- [ ] **Bước 2: Chạy kiểm thử đồng thời có giới hạn**

Gửi 200 yêu cầu với mức đồng thời 20 đến `/` và `/api/health`, sử dụng `ab` nếu đã cài đặt, nếu không thì chạy `curl` song song. Ghi lại số yêu cầu, yêu cầu thất bại, phản hồi ngoài nhóm 2xx và độ trễ.

Kết quả mong đợi: không có lỗi kết nối và không có mã trạng thái HTTP ngoài dự kiến. Đây là kiểm tra tải sơ bộ có giới hạn, không phải chứng nhận năng lực chịu tải.

- [ ] **Bước 3: Kiểm tra Chromium trên máy tính**

Mở `http://161.248.81.124` bằng Chromium không giao diện ở kích thước `1440x900`, ghi lại bảng điều khiển trình duyệt và các yêu cầu mạng thất bại, chờ hoạt động mạng tạm lắng và trạng thái tải của ứng dụng ổn định, rồi lưu `screenshots/production-desktop.png`.

Kết quả mong đợi: không có ngoại lệ trong bảng điều khiển, không có yêu cầu API của chính ứng dụng bị thất bại, không xuất hiện tình trạng kẹt tải, chồng lấn, cắt mất nội dung hoặc tràn ngang.

- [ ] **Bước 4: Kiểm tra Chromium trên thiết bị di động**

Lặp lại ở kích thước `390x844` và lưu `screenshots/production-mobile.png`.

Kết quả mong đợi: đáp ứng cùng các tiêu chí chức năng, phần điều hướng và nội dung dễ đọc, không tràn ngang.

- [ ] **Bước 5: Xác minh cơ chế truyền thông tin xác thực**

Sử dụng tài khoản kiểm thử sẵn có theo cách không làm hỏng dữ liệu. Xác nhận đăng nhập trả về cookie làm mới với `HttpOnly`, `SameSite=Lax` và không có `Secure` khi dùng HTTP; làm mới thành công; đăng xuất làm hết hạn chính cookie đó. Không tạo hoặc sửa dữ liệu của người dùng thực nếu chưa được cho phép riêng.

- [ ] **Bước 6: Lên lịch xóa ảnh chụp màn hình**

Tạo bộ hẹn giờ systemd tạm thời hoặc tác vụ `at` chỉ xóa đúng hai đường dẫn ảnh chụp màn hình môi trường vận hành chính thức sau 24 giờ. Xác minh đơn vị hoặc tác vụ đã lên lịch tồn tại. Không dùng mẫu ký tự đại diện trên phạm vi rộng hoặc xóa đệ quy.

- [ ] **Bước 7: Ghi lại bằng chứng và trạng thái cuối cùng**

Cập nhật `docs/wiki/operations.md` với thời điểm triển khai, SHA của commit, kết quả hai vòng kiểm tra, rủi ro HTTP đã biết, URL công khai và hành động tiếp theo (tên miền cùng TLS). Đưa liên kết đến hai ảnh chụp màn hình vào phần bàn giao, báo cáo mọi tiêu chí nghiệm thu chưa đạt là trở ngại và tuyệt đối không tuyên bố thành công nếu chưa có bằng chứng mới cho từng kiểm tra bắt buộc.

- [ ] **Bước 8: Tạo commit ghi lại trạng thái vận hành cuối cùng**

```bash
git add docs/wiki/operations.md
git commit -m "docs: record production deployment verification"
```
