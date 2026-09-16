# Thiết kế triển khai vận hành chính thức qua IP công khai

## Mục tiêu

Triển khai ứng dụng RentalRoom hiện có thành một dịch vụ hoạt động liên tục tại
`http://161.248.81.124`, sử dụng dữ liệu MongoDB Atlas đã được cung cấp và tự động
khởi động lại sau khi ứng dụng gặp sự cố hoặc máy chủ khởi động lại.

Đây là phương án triển khai tạm thời qua IP công khai. Phương án này chưa được coi là
an toàn cho thông tin xác thực thật hoặc dữ liệu cá nhân cho đến khi bổ sung tên miền
và chứng chỉ HTTPS được tin cậy.

## Các ràng buộc hiện tại

- Máy chủ chạy Ubuntu 24.04 với địa chỉ IPv4 công khai `161.248.81.124`.
- Đã cài Node.js 22 và Yarn 1.22; chưa cài Nginx.
- Ứng dụng gồm giao diện Create React App và máy chủ ứng dụng Express/Socket.IO
  sử dụng MongoDB Atlas làm cơ sở dữ liệu.
- Chưa có tên miền nên giai đoạn này không thể cung cấp HTTPS được trình duyệt tin cậy.
- Các giá trị bí mật đã cung cấp từng xuất hiện trong lịch sử hội thoại. Phải thay mới
  chúng trước khi coi bản triển khai này là an toàn cho vận hành chính thức.
- Không đưa các thay đổi có sẵn trong cây làm việc và ảnh chụp màn hình không liên quan
  vào các bản ghi thay đổi phục vụ triển khai.

## Kiến trúc

Nginx sẽ là thành phần ứng dụng duy nhất lắng nghe công khai trên cổng TCP 80. Nginx sẽ:

- phục vụ ứng dụng React đã biên dịch từ thư mục phát hành;
- trả về `index.html` cho các đường dẫn do phía máy khách xử lý;
- chuyển tiếp `/api/` tới dịch vụ Express trên `127.0.0.1:8000`;
- chuyển tiếp `/socket.io/` kèm các tiêu đề nâng cấp WebSocket tới cùng dịch vụ;
- bổ sung các tiêu đề bảo mật và bộ nhớ đệm cơ bản nhưng không lưu đệm `index.html`.

Máy chủ ứng dụng sẽ chạy dưới dạng một dịch vụ systemd riêng bằng tài khoản
`codexproxy` hiện có, không có đặc quyền. Dịch vụ chỉ lắng nghe trên địa chỉ nội bộ,
đọc các giá trị bí mật từ một tệp môi trường nằm ngoài Git mà chỉ chủ sở hữu có quyền đọc,
khởi động lại khi gặp lỗi và khởi động sau khi mạng sẵn sàng.

Bản dựng giao diện cho môi trường vận hành chính thức sẽ sử dụng nguồn gốc của trang
trong trình duyệt cho lưu lượng HTTP API và Socket.IO. Nhờ đó, giao diện và máy chủ
ứng dụng có cùng nguồn gốc, đồng thời tránh đưa URL Render đã lỗi thời vào gói mã.

## Thay đổi ứng dụng

Các thay đổi phải giới hạn trong phạm vi bảo đảm triển khai đúng:

1. Đặt địa chỉ API dự phòng của giao diện trong môi trường vận hành chính thức về cùng nguồn gốc.
   Vẫn hỗ trợ cấu hình `REACT_APP_API_URL` tường minh.
2. Để thuộc tính bảo mật của cookie xác thực phụ thuộc vào việc yêu cầu có thực sự dùng
   HTTPS hay không, thay vì đặt `Secure` chỉ vì `NODE_ENV=production`. Điều này cho phép
   triển khai HTTP tạm thời đã được chấp thuận. Cookie vẫn có `HttpOnly`; dùng
   `SameSite=Lax` trên HTTP và `SameSite=None; Secure` trên HTTPS.
3. Thêm một điểm kiểm tra tình trạng gọn nhẹ cho máy chủ ứng dụng, báo cáo mức độ sẵn sàng
   của tiến trình và trạng thái kết nối MongoDB mà không tiết lộ các giá trị bí mật.
4. Để địa chỉ lắng nghe của máy chủ ứng dụng tuân theo `HOST`, mặc định giữ hành vi hiện tại
   là lắng nghe trên mọi địa chỉ khi phát triển và dùng `127.0.0.1` khi triển khai vận hành chính thức.
5. Thêm các mẫu cấu hình và tập lệnh triển khai Nginx/systemd được quản lý phiên bản,
   cùng tệp ví dụ biến môi trường chỉ chứa giá trị giữ chỗ.

Thay đổi hành vi yêu cầu viết kiểm thử trước. Cấu hình thuần túy trên máy chủ được
kiểm chứng bằng kiểm tra cú pháp và các phép kiểm tra tích hợp trực tiếp.

## Cấu hình và thông tin bí mật

Các giá trị `.env` đã cung cấp sẽ được cài vào một tệp môi trường vận hành chính thức
không được quản lý phiên bản, thuộc sở hữu của `codexproxy` với quyền `0600`.
Các chú thích nằm sau giá trị sẽ bị loại bỏ. Các giá trị ghi đè cho môi trường này gồm:

- `NODE_ENV=production`
- `PORT=8000`
- `HOST=127.0.0.1`
- `FRONTEND_URL=http://161.248.81.124`

Không giá trị bí mật nào được xuất hiện trong lịch sử Git, định nghĩa dịch vụ,
cấu hình Nginx, nhật ký kiểm thử, ảnh chụp màn hình hoặc báo cáo cuối cùng. MongoDB Atlas
phải cho phép truy cập cơ sở dữ liệu từ `161.248.81.124/32`. Nếu Atlas từ chối kết nối,
việc triển khai phải dừng lại với báo cáo rõ ràng về trở ngại cơ sở dữ liệu,
thay vì tuyên bố sản phẩm đang hoạt động tốt.

Trước khi mời người dùng thật, phải thay mới ít nhất mật khẩu MongoDB, cả hai khóa
bí mật JWT, khóa Gemini, mật khẩu ứng dụng Gmail, khóa bí mật Cloudinary và mọi
mã thông báo khác có trong tệp đã cung cấp.

## Vòng đời dịch vụ

Giao diện được dựng vào một thư mục phát hành không phụ thuộc dấu thời gian,
thuộc sở hữu của người dùng triển khai. Nginx đọc bản dựng nhưng không thể sửa các tệp mã nguồn.

Đơn vị dịch vụ systemd của máy chủ ứng dụng sẽ khởi động lại khi gặp lỗi, có khoảng
chờ khởi động lại được giới hạn và ghi nhật ký vào journal. Các lệnh triển khai phải có
tính lũy đẳng: lần chạy thứ hai có thể dựng lại/khởi động lại dịch vụ nhưng không được
tạo cấu hình trùng lặp hoặc làm mất dữ liệu.

Cơ sở dữ liệu MongoDB vẫn nằm trên Atlas; việc triển khai không nạp dữ liệu mẫu,
chuyển đổi cấu trúc, xóa hoặc ghi lại dữ liệu hiện có.

## Mạng và bảo mật

- Chỉ có các dịch vụ lắng nghe công khai: SSH `22/tcp` và Nginx `80/tcp`.
- Máy chủ ứng dụng `8000/tcp`: chỉ dùng địa chỉ nội bộ và không được mở ra ngoài qua tường lửa.
- Nginx từ chối các tệp ẩn và chỉ phục vụ thư mục giao diện đã biên dịch.
- Giới hạn kích thước nội dung yêu cầu và thời gian chờ chuyển tiếp được cấu hình tường minh.
- Tuyệt đối không đưa các giá trị bí mật vào bản ghi thay đổi.
- HTTP là rủi ro tạm thời được chấp nhận. Kẻ tấn công trên đường truyền có thể quan sát
  hoặc sửa đổi mật khẩu, cookie, tin nhắn và dữ liệu thanh toán cho đến khi có HTTPS.

Thay đổi tường lửa phải giữ nguyên đường truy cập SSH đang hoạt động trước khi bật
các quy tắc. Nếu tường lửa phía trước/đám mây chặn cổng 80, kiểm tra tình trạng dịch vụ
cục bộ có thể đạt trong khi truy cập bên ngoài vẫn bị chặn; vì vậy phải kiểm tra cả hai đường truy cập.

## Xử lý lỗi và khả năng quan sát

- Nginx trả mã `502` rõ ràng khi máy chủ ứng dụng không khả dụng, đồng thời vẫn phục vụ
  khung giao diện.
- `/api/health` phân biệt tiến trình còn hoạt động với tiến trình đã sẵn sàng kết nối
  cơ sở dữ liệu, đồng thời trả mã trạng thái sẵn sàng không thành công khi MongoDB mất kết nối.
- Nhật ký máy chủ ứng dụng được gửi vào journald; nhật ký truy cập/lỗi Nginx dùng
  thiết lập luân chuyển nhật ký mặc định của hệ thống.
- Tài liệu triển khai bao gồm các lệnh kiểm tra trạng thái, khởi động lại, xem nhật ký,
  khôi phục phiên bản trước và thay mới thông tin bí mật.

## Kiểm chứng và tiêu chí nghiệm thu

Chỉ nghiệm thu bản triển khai sau hai vòng kiểm chứng độc lập.

### Vòng 1: kiểm tra bản dựng và dịch vụ

- Các bài kiểm thử tự động của máy chủ ứng dụng đạt.
- Các bài kiểm thử tự động của giao diện đạt ở chế độ không theo dõi thay đổi.
- Quá trình dựng giao diện cho môi trường vận hành chính thức kết thúc thành công.
- Kiểm tra cú pháp cấu hình Nginx đạt.
- systemd báo máy chủ ứng dụng và Nginx đang hoạt động.
- Thực hiện các phép kiểm tra giao diện cục bộ, điểm kiểm tra tình trạng, chuyển tiếp API
  và bắt tay WebSocket.
- Kiểm tra cấu hình khởi động lại dịch vụ và tự chạy sau khi máy chủ khởi động lại.
- Phần khác biệt Git không chứa thông tin bí mật.

### Vòng 2: kiểm tra đường truy cập công khai và trình duyệt

- Yêu cầu tới `http://161.248.81.124` qua đường truy cập công khai trả về ứng dụng React.
- Điểm kiểm tra tình trạng và các API chỉ đọc tiêu biểu phản hồi qua Nginx.
- Kiểm thử đồng thời có giới hạn kiểm tra trang chủ và điểm kiểm tra tình trạng
  để phát hiện lỗi kết nối và mã trạng thái ngoài dự kiến.
- Chromium kiểm tra giao diện máy tính `1440x900` và điện thoại `390x844`.
- Kiểm tra bảng điều khiển trình duyệt, yêu cầu thất bại, lỗi tràn khi thích ứng kích thước
  màn hình và các trạng thái đang tải, trống, lỗi.
- Lưu ảnh chụp màn hình máy tính và điện thoại, liên kết ảnh trong báo cáo và lên lịch
  xóa sau 24 giờ.

Không được tuyên bố đạt nếu cơ sở dữ liệu mất kết nối, xác thực không hoạt động,
không truy cập được đường dẫn công khai, kiểm thử thất bại hoặc vẫn còn lỗi trình duyệt/API.

## Tài liệu và khôi phục phiên bản trước

`README.md` ở thư mục gốc kho mã sẽ trở thành điểm bắt đầu tìm hiểu sản phẩm và liên kết
tới `docs/wiki/operations.md`. Cả hai tài liệu sẽ ghi lại các tính năng đã triển khai,
trạng thái triển khai hiện tại, rủi ro HTTP đã biết, công việc đang làm, bước tiếp theo,
yêu cầu kiểm chứng hai vòng và chính sách lưu giữ ảnh chụp màn hình.

Việc khôi phục sẽ khôi phục cấu hình trang Nginx và đơn vị dịch vụ systemd trước đó
từ các bản sao lưu có dấu thời gian, khôi phục thư mục bản dựng giao diện trước đó,
nạp lại systemd và Nginx, rồi xác minh phản hồi kiểm tra tình trạng hoạt động tốt gần nhất.
Việc triển khai hoặc khôi phục không sửa đổi dữ liệu cơ sở dữ liệu.

## Công việc để sau

- Đăng ký hoặc trỏ tên miền tới `161.248.81.124`.
- Cấp và tự động gia hạn chứng chỉ TLS được tin cậy.
- Bắt buộc chuyển hướng HTTP sang HTTPS và luôn yêu cầu cookie có thuộc tính Secure.
- Thay mới toàn bộ thông tin xác thực đã lộ và thu hồi các giá trị cũ.
- Cấu hình chính sách giám sát, cảnh báo và sao lưu ngoài máy chủ nếu dịch vụ trở nên
  thiết yếu đối với hoạt động kinh doanh.
