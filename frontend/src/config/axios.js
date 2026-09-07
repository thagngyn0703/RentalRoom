import axios from 'axios';
import { resolveApiBaseUrl } from './apiBaseUrl';

// Config axios một lần cho toàn project
// Mặc định gọi cùng origin; REACT_APP_API_URL chỉ dùng khi tách riêng backend.
const API_BASE_URL = resolveApiBaseUrl(process.env.REACT_APP_API_URL);

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

export default axios;
