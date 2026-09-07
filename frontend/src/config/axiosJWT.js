import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import store from '../redux/store';
import { loginSuccess } from '../redux/slices/authSlice';
import { resolveApiBaseUrl } from './apiBaseUrl';

// Tạo axios instance riêng cho các API cần JWT
// Mặc định gọi cùng origin; REACT_APP_API_URL chỉ dùng khi tách riêng backend.
const API_BASE_URL = resolveApiBaseUrl(process.env.REACT_APP_API_URL);

const axiosJWT = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Hàm refresh access token khi token hết hạn hoặc đã reload trang không còn token trong memory
const refreshAccessToken = async () => {
  try {
    // Gọi API refresh token với cookie chứa refresh token
    const res = await axios.post("/api/auth/refreshToken", {}, {
      withCredentials: true
    });
    return res.data;
  } catch (error) {
    // Nếu refresh thất bại thì chuyển về trang login
    window.location.href = '/login';
    return null;
  }
};

// Request interceptor - Chặn và xử lý mọi request trước khi gửi
axiosJWT.interceptors.request.use(async (config) => {
  // Lấy state hiện tại từ Redux store
  const state = store.getState();
  const accessToken = state?.auth?.login?.accessToken || "";
  const currentUser = state?.auth?.login?.currentUser || null;

  // Kiểm tra xem có access token không
  if (accessToken) {
    try {
      // Giải mã token để lấy thời gian hết hạn
      const token = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;
      const isExpired = token.exp < currentTime;

      // Nếu token đã hết hạn thì refresh
      if (isExpired) {
        const data = await refreshAccessToken();

        if (data) {
          // Cập nhật Redux store với token mới
          const refreshUser = {
            user: currentUser,
            accessToken: data.accessToken
          };
          store.dispatch(loginSuccess(refreshUser));

          // Sử dụng token mới cho request này
          config.headers["token"] = `Bearer ${data.accessToken}`;
        } else {
          // Nếu refresh thất bại thì hủy request
          return Promise.reject(new Error('AUTH_FAILED'));
        }
      } else {
        // Token còn hạn thì dùng token hiện tại
        config.headers["token"] = `Bearer ${accessToken}`;
      }
    } catch (error) {
      // Nếu có lỗi decode token thì vẫn dùng token cũ
      config.headers["token"] = `Bearer ${accessToken}`;
    }
  }
  else {
    const data = await refreshAccessToken();

    if (data) {
      // Cập nhật Redux store với token mới
      const refreshUser = {
        user: currentUser,
        accessToken: data.accessToken
      };
      store.dispatch(loginSuccess(refreshUser));

      // Sử dụng token mới cho request này
      config.headers["token"] = `Bearer ${data.accessToken}`;
    } else {
      // Nếu refresh thất bại thì hủy request
      return Promise.reject(new Error('AUTH_FAILED'));
    }

  }
  // Không có token thì để trống, backend sẽ trả về 401

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosJWT;
