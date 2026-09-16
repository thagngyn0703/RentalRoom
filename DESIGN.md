---
version: 2
name: Trọ Chung – Không gian sống mỗi ngày
description: Nền tảng phòng trọ rõ ràng, gần gũi dành cho người dùng Việt Nam.
colors:
  primary: "#087F72"
  primary-dark: "#075B51"
  secondary: "#B76536"
  surface: "#FFFFFF"
  surface-soft: "#F6F8F5"
  on-surface: "#193B34"
  on-surface-muted: "#64756F"
  border: "#E1E9E3"
  error: "#C62828"
typography:
  heading:
    fontFamily: Inter, Arial, sans-serif
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: Inter, Arial, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Inter, Arial, sans-serif
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
rounded:
  sm: 6px
  md: 10px
  lg: 16px
  full: 9999px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 12px
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    borderColor: "{colors.border}"
  home-hero:
    rounded: 24px
    textOverlay: separate-column
    imageFit: cover
---

## Tổng quan

Trọ Chung cần mang lại cảm giác thiết thực, thân thiện và đáng tin cậy. Thông tin
nhà ở là trọng tâm; yếu tố trang trí không được lấn át giá, vị trí hoặc thao tác.

## Màu sắc

Xanh ngọc dùng cho thao tác chính, xanh rừng làm điểm tựa cho thanh điều hướng và
chân trang. Nền trắng ngà ấm giúp ảnh bài đăng rõ nét. Màu đất nung tạo điểm nhấn.
Văn bản thông thường phải đạt độ tương phản WCAG AA.

## Kiểu chữ

Inter là phông chữ của sản phẩm. Tiêu đề rõ ràng, gọn; nội dung dễ đọc trên màn
hình điện thoại. Chỉ rút gọn văn bản trong phần tóm tắt của thẻ bài đăng.

## Bố cục

Khoảng cách theo đơn vị cơ bản 8px và bước nhỏ 4px. Nội dung trên máy tính dùng
lưới có giới hạn chiều rộng; trên điện thoại chuyển thành một cột với khoảng
đệm hai bên ít nhất 16px. Không thành phần nào được làm trang tràn ngang.

## Độ nổi và chiều sâu

Ưu tiên đường viền và bóng đổ nhẹ, tiết chế. Độ nổi dùng để thể hiện thẻ có thể
tương tác hoặc thanh điều hướng cố định, không chỉ để trang trí.

## Hình dạng

Dùng bán kính bo góc 6–16px nhất quán. Dạng viên thuốc chỉ dùng cho nhãn trạng
thái và giá có kích thước nhỏ gọn.

## Thành phần giao diện

Ảnh quảng bá trong trình chiếu cũ đã chứa chữ, vì vậy không thêm lớp chú thích
đè lên ảnh. Ảnh cần văn bản thay thế có ý nghĩa; các nút điều khiển phải dùng
được bằng bàn phím và dễ nhìn trên nền ảnh.

Nút cần thể hiện rõ trạng thái rê chuột, nhấn, vô hiệu hóa và được chọn bằng
bàn phím. Trạng thái đang tải, không có dữ liệu và lỗi phải giữ bố cục ổn định,
sử dụng thông báo dễ hiểu.

## Nên và không nên

- Giữ thứ bậc rõ ràng từ điều hướng đến nội dung quảng bá rồi đến danh sách bài đăng.
- Kiểm thử trên máy tính và điện thoại bằng dữ liệu thật, cả khi tải chậm hoặc có lỗi.
- Giữ văn bản và các nút tương tác trong phạm vi phần tử chứa.
- Không chồng thêm nội dung quảng bá trùng lặp lên ảnh đã có chữ.
- Không che giấu ảnh hỏng, lỗi API hoặc dấu hiệu chọn bằng bàn phím.
- Không dùng chiều cao chỉ dựa trên khung nhìn khiến nội dung bị cắt.

## Tài liệu dự án

Trang công khai `/docs` dùng thanh điều hướng xanh ngọc và nền trắng ngà hiện có.
Trên máy tính, danh mục tài liệu nằm cạnh khung đọc màu trắng; trên điện thoại,
danh mục xếp phía trên. Giữ nguyên tiêu đề, bảng và khối mã Markdown; đoạn mã dài
được cuộn trong khung. Thanh điều hướng và trình đơn điện thoại đều có mục “Tài liệu”.
