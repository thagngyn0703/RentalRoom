# Trang quản lý tin hỗ trợ dành cho quản trị viên

## Mô tả
Trang quản trị quản lý các tin hỗ trợ mà người dùng gửi lên hệ thống. Chỉ có tài khoản quản trị viên mới có thể truy cập trang này.

## URL
- `/admin/viewsupport` - Trang quản lý tin hỗ trợ

## Tính năng

### 1. Hiển thị danh sách tin hỗ trợ
- Hiển thị tất cả tin hỗ trợ từ mô hình dữ liệu `Support`
- Phân trang với 10 tin mỗi trang
- Hiển thị thông tin: tên người gửi, email, tin nhắn, trạng thái, ngày tạo

### 2. Lọc theo trạng thái
- Tất cả
- Mở (open)
- Đang xử lý (in_progress) 
- Đã đóng (closed)

### 3. Cập nhật trạng thái
- Danh sách thả xuống để thay đổi trạng thái trực tiếp từ bảng
- Các trạng thái: Mở, Đang xử lý, Đã đóng

### 4. Xem chi tiết
- Hộp thoại hiển thị đầy đủ thông tin tin hỗ trợ
- Bao gồm: tên, email, số điện thoại, tin nhắn, trạng thái, ngày tạo, ngày cập nhật

### 5. Thống kê
- Tổng số tin hỗ trợ
- Số tin đang mở
- Số tin đã đóng

## Bảo mật
- Chỉ tài khoản quản trị viên mới có thể truy cập
- Sử dụng `ProtectedRoute` với `requireAdmin=true`
- Phần máy chủ có lớp kiểm tra trung gian `verifyAdmin` để kiểm tra quyền

## Các điểm truy cập API
- `GET /api/support/admin/all` - Lấy danh sách tin hỗ trợ (chỉ dành cho quản trị viên)
- `PUT /api/support/admin/:id/status` - Cập nhật trạng thái (chỉ dành cho quản trị viên)

## Cách sử dụng
1. Đăng nhập bằng tài khoản quản trị viên
2. Nhấn vào nút "Admin" trên thanh điều hướng
3. Chọn "Quản lý tin hỗ trợ" từ trình đơn thả xuống
4. Hoặc truy cập trực tiếp `/admin/viewsupport`
