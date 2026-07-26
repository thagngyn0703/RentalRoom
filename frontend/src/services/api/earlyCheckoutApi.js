import axiosJWT from '../../config/axiosJWT';

const earlyCheckoutApi = {
  // User: Tạo yêu cầu trả phòng sớm
  createRequest: async (data) => {
    const res = await axiosJWT.post('/api/early-checkout', data);
    return res.data;
  },

  // User: Lấy danh sách yêu cầu của mình
  getMyRequests: async () => {
    const res = await axiosJWT.get('/api/early-checkout/my');
    return res.data;
  },

  // Admin: Lấy tất cả yêu cầu
  getAllRequests: async () => {
    const res = await axiosJWT.get('/api/early-checkout/admin/all');
    return res.data;
  },

  // Admin: Phê duyệt yêu cầu
  approveRequest: async (requestId, adminNote = '') => {
    const res = await axiosJWT.put(`/api/early-checkout/admin/${requestId}/approve`, { adminNote });
    return res.data;
  },

  // Admin: Từ chối yêu cầu
  rejectRequest: async (requestId, adminNote = '') => {
    const res = await axiosJWT.put(`/api/early-checkout/admin/${requestId}/reject`, { adminNote });
    return res.data;
  },
};

export default earlyCheckoutApi;