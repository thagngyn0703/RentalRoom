import React, { useEffect, useState } from 'react';
import axiosJWT from '../../../config/axiosJWT';
import Pagination from '@mui/material/Pagination';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

const AdminDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;

  const statusMeta = {
    pending: { color: 'warning', label: 'Chờ xác nhận' },
    approved: { color: 'success', label: 'Đã xác nhận' },
    rejected: { color: 'error', label: 'Đã từ chối' },
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosJWT.get('/api/payments/deposits/admin');
      const list = Array.isArray(res.data) ? res.data : [];
      setDeposits(list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    } catch (err) {
      console.error('AdminDeposits fetch error:', err);
      setError('Không thể tải danh sách yêu cầu đặt cọc');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDeposit = async (depositId) => {
    try {
      await axiosJWT.put(`/api/payments/deposits/${depositId}/approve`);
      alert('Đã xác nhận đặt cọc');
      fetchDeposits();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRejectDeposit = async (depositId) => {
    try {
      await axiosJWT.put(`/api/payments/deposits/${depositId}/reject`);
      alert('Đã từ chối đặt cọc');
      fetchDeposits();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const totalPages = Math.max(1, Math.ceil(deposits.length / PAGE_SIZE));
  const paged = deposits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', marginTop: 32 }}>
      {error && (
        <div
          style={{
            color: '#d32f2f',
            background: '#fff3f3',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}
      {loading && <div style={{ marginBottom: 12, textAlign: 'center' }}>Đang tải...</div>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 16px 0 rgba(25, 118, 210, 0.07)' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f4f6fb' }}>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Phòng</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Người đặt</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Số tiền</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Thời gian</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: '#888' }}>
                  Chưa có yêu cầu đặt cọc nào.
                </TableCell>
              </TableRow>
            )}
            {paged.map((deposit) => {
              const meta = statusMeta[deposit.status] || { color: 'default', label: deposit.status || '—' };
              return (
                <TableRow key={deposit._id} hover sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: '#e3f2fd' } }}>
                  <TableCell align="center">
                    {deposit.room ? (deposit.room.roomType || deposit.room.address) : 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    {deposit.user ? (deposit.user.email || deposit.user.name || deposit.user.username) : 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    {deposit.amount != null ? Number(deposit.amount).toLocaleString('vi-VN') : '—'} VND
                  </TableCell>
                  <TableCell align="center">
                    {deposit.startDate && deposit.endDate
                      ? `${new Date(deposit.startDate).toLocaleDateString('vi-VN')} - ${new Date(deposit.endDate).toLocaleDateString('vi-VN')}`
                      : '—'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={meta.label}
                      color={meta.color}
                      variant={deposit.status === 'pending' ? 'outlined' : 'filled'}
                      sx={{ fontWeight: 600, fontSize: 14, px: 1.25, py: 0.25, borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {deposit.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleApproveDeposit(deposit._id)}
                          sx={{ fontWeight: 700, borderRadius: 2, px: 2, boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.10)' }}
                        >
                          Xác nhận
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleRejectDeposit(deposit._id)}
                          sx={{ fontWeight: 700, borderRadius: 2, px: 2 }}
                        >
                          Từ chối
                        </Button>
                      </div>
                    ) : (
                      <Chip label="Đã xử lý" variant="outlined" size="small" sx={{ borderRadius: 2 }} />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          shape="rounded"
          size="large"
        />
      </div>
    </div>
  );
};

export default AdminDeposits;
