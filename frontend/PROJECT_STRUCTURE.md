# Cấu trúc thư mục chuẩn cho dự án React

```
src/
├── components/          # Các thành phần tái sử dụng
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   └── Input.jsx
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Sidebar.jsx
│   └── common/
│       ├── Loading.jsx
│       └── ErrorMessage.jsx
│
├── pages/               # Các trang/màn hình
│   ├── HomePage/
│   │   ├── HomePage.jsx
│   │   └── HomePage.css
│   ├── LoginPage/
│   │   ├── LoginPage.jsx
│   │   └── LoginPage.css
│   └── UserManagement/
│       ├── UserList.jsx
│       └── UserDetail.jsx
│
├── services/            # Lời gọi API và xử lý nghiệp vụ
│   ├── api/
│   │   ├── authApi.js
│   │   ├── userApi.js
│   │   └── index.js
│   └── httpClient.js
│
├── hooks/               # Các hook tùy chỉnh
│   ├── useAuth.js
│   └── useApi.js
│
├── utils/               # Các hàm tiện ích
│   ├── constants.js
│   ├── helpers.js
│   └── validators.js
│
├── redux/               # Chỉ chứa xử lý trạng thái Redux
│   ├── slices/
│   │   ├── authSlice.js
│   │   └── userSlice.js
│   └── store.js
│
└── config/              # Các tệp cấu hình
    ├── axios.js
    └── axiosJWT.js
```

## Lợi ích:
- **components/**: Chỉ chứa thành phần giao diện tái sử dụng
- **pages/**: Chứa các trang/màn hình cụ thể
- **services/**: Tách riêng xử lý API khỏi Redux
- **Phân tách trách nhiệm**: Mỗi thư mục có trách nhiệm riêng
- **Khả năng mở rộng**: Dễ mở rộng khi dự án lớn
