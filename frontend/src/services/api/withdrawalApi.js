import axiosJWT from '../../config/axiosJWT';

export async function createWithdrawal(body) {
  const res = await axiosJWT.post('/api/withdrawals', body);
  return res.data;
}

export async function getMyWithdrawals() {
  const res = await axiosJWT.get('/api/withdrawals/mine');
  return res.data;
}

export async function cancelWithdrawal(id) {
  const res = await axiosJWT.put(`/api/withdrawals/${id}/cancel`);
  return res.data;
}

export async function getPendingWithdrawalsAdmin() {
  const res = await axiosJWT.get('/api/withdrawals/admin/pending');
  return res.data;
}

export async function approveWithdrawalAdmin(id) {
  const res = await axiosJWT.put(`/api/withdrawals/admin/${id}/approve`);
  return res.data;
}

export async function rejectWithdrawalAdmin(id, adminNote) {
  const res = await axiosJWT.put(`/api/withdrawals/admin/${id}/reject`, { adminNote });
  return res.data;
}
