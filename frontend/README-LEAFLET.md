# Tích hợp bản đồ Leaflet (ghi chú phát triển)

Dự án đã được mở rộng để sử dụng Leaflet và OpenStreetMap khi chọn vị trí trên bản đồ, không cần khóa API của Google.

## Cài đặt thư viện

Chạy lệnh trong thư mục `frontend`.

Với Yarn:

```bash
yarn add react-leaflet leaflet
```

Với npm:

```bash
npm install react-leaflet leaflet
```

## Lưu ý sử dụng

- Thành phần `src/Components/Map/LeafletMap.jsx` cung cấp bản đồ và nhận hàm gọi lại `onSelect`.
- Khi nhấn vào bản đồ, ứng dụng thử chuyển tọa độ thành địa chỉ qua Nominatim (OpenStreetMap). Nominatim giới hạn tần suất yêu cầu khi sử dụng nhiều; khi triển khai chính thức, nên cân nhắc nhà cung cấp dịch vụ chuyển đổi địa chỉ có trả phí hoặc tự vận hành dịch vụ.
- Thành phần `selectLocation.jsx` đã được cập nhật để hiển thị bản đồ và lưu `mapLat`, `mapLng`, `mapAddress` vào trạng thái dùng chung `nameLocation` khi người dùng nhấn vào bản đồ.

## Kiểm thử

1. Trong thư mục `frontend`, chạy `yarn start` hoặc `npm start`.
2. Mở trang mời ở ghép/đăng tin, chọn các thông tin địa chỉ rồi nhấn "Xác nhận" để hiện vùng bản đồ. Sau đó nhấn vào bản đồ để đặt điểm đánh dấu và lấy tọa độ.
