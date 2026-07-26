import axios from 'axios';

// Config axios một lần cho toàn project
// - Dev local: ưu tiên gọi relative URL để CRA proxy chuyển tiếp (tránh CORS/preflight)
// - Production: fallback về backend deploy nếu không cấu hình env
const API_URL_FROM_ENV = (process.env.REACT_APP_API_URL || '').trim();
const IS_DEV = process.env.NODE_ENV === 'development';
const API_BASE_URL =
  API_URL_FROM_ENV || (IS_DEV ? '' : 'https://trochung-deployment-phase2.onrender.com');

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

export default axios;