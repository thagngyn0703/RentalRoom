import axiosJWT from '../../config/axiosJWT';
import axios from 'axios';

export const CommentApi = {
  listByPost: async (postId) => {
    // GET comments không cần auth, dùng axios thường
    // use relative path so axios.defaults.baseURL is applied
    const res = await axios.get(`/api/comments/post/${postId}`);
    return res.data?.comments || [];
  },
  create: async (postId, payload) => {
    // POST comment cần auth, dùng axiosJWT
    const res = await axiosJWT.post(`/api/comments/post/${postId}`, payload);
    return res.data?.comment;
  },
  update: async (id, payload) => {
    // PUT comment cần auth
    const res = await axiosJWT.put(`/api/comments/${id}`, payload);
    return res.data?.comment;
  },
  remove: async (id) => {
    // DELETE comment cần auth
    const res = await axiosJWT.delete(`/api/comments/${id}`);
    return res.data?.success === true;
  }
};


