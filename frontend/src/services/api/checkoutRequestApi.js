import axiosJWT from '../../config/axiosJWT';

const checkoutRequestApi = {
  create: async (data) => {
    const res = await axiosJWT.post('/api/checkout-request', data);
    return res.data;
  },
  getMy: async () => {
    const res = await axiosJWT.get('/api/checkout-request/my');
    return res.data;
  },
  getAllAdmin: async () => {
    const res = await axiosJWT.get('/api/checkout-request/admin/all');
    return res.data;
  },
  getAllOwner: async () => {
    const res = await axiosJWT.get('/api/checkout-request/owner/all');
    return res.data;
  },
  approveOwner: async (requestId, ownerNote = '') => {
    const res = await axiosJWT.put(`/api/checkout-request/owner/${requestId}/approve`, { ownerNote });
    return res.data;
  },
  rejectOwner: async (requestId, ownerNote = '') => {
    const res = await axiosJWT.put(`/api/checkout-request/owner/${requestId}/reject`, { ownerNote });
    return res.data;
  },
  confirmAdmin: async (requestId, adminNote = '') => {
    const res = await axiosJWT.put(`/api/checkout-request/admin/${requestId}/confirm`, { adminNote });
    return res.data;
  },
};

export default checkoutRequestApi;
