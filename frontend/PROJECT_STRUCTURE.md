# Cấu trúc thư mục chuẩn cho dự án React

```
src/
├── components/          # Các component tái sử dụng
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
├── services/            # API calls và business logic
│   ├── api/
│   │   ├── authApi.js
│   │   ├── userApi.js
│   │   └── index.js
│   └── httpClient.js
│
├── hooks/               # Custom hooks
│   ├── useAuth.js
│   └── useApi.js
│
├── utils/               # Utility functions
│   ├── constants.js
│   ├── helpers.js
│   └── validators.js
│
├── redux/               # Chỉ chứa Redux logic
│   ├── slices/
│   │   ├── authSlice.js
│   │   └── userSlice.js
│   └── store.js
│
└── config/              # Configuration files
    ├── axios.js
    └── axiosJWT.js
```

## Lợi ích:
- **components/**: Chỉ chứa UI components tái sử dụng
- **pages/**: Chứa các trang/màn hình cụ thể
- **services/**: Tách riêng API logic khỏi Redux
- **Separation of concerns**: Mỗi folder có trách nhiệm riêng
- **Scalable**: Dễ mở rộng khi dự án lớn
```