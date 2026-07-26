import axiosJWT from '../../config/axiosJWT';
import axios from 'axios';

export const RatingApi = {
  upsert: async (postId, payload) => {
    // POST rating cần auth
    const res = await axiosJWT.post(`/api/ratings/post/${postId}`, payload);
    return res.data?.rating;
  },
  stats: async (postId) => {
    // GET stats không cần auth, dùng axios thường
    // use relative path so axios.defaults.baseURL is applied
    const res = await axios.get(`/api/ratings/post/${postId}/stats`);
    return res.data?.stats || { average: 0, count: 0 };
  },
  me: async (postId) => {
    // GET my rating cần auth
    const res = await axiosJWT.get(`/api/ratings/post/${postId}/me`);
    return res.data?.rating || null;
  }
};


