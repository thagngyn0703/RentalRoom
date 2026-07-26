import axiosJWT from '../../config/axiosJWT';

const extendPaymentApi = {
  getOwnerPending: async () => {
    const res = await axiosJWT.get('/api/payments/extend/owner/pending');
    return res.data;
  },
  approveOwner: async (historyId) => {
    const res = await axiosJWT.put(`/api/payments/extend/owner/${historyId}/approve`, {});
    return res.data;
  },
  rejectOwner: async (historyId) => {
    const res = await axiosJWT.put(`/api/payments/extend/owner/${historyId}/reject`, {});
    return res.data;
  },
  confirmPaid: async (historyId) => {
    const res = await axiosJWT.post('/api/payments/extend/user/paid', { historyId });
    return res.data;
  },
};

export default extendPaymentApi;

