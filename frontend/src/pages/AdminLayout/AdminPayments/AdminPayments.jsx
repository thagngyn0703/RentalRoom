import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Pagination,
} from '@mui/material';
import axiosJWT from '../../../config/axiosJWT';
import { useConfirm } from '../../../Components/ConfirmProvider';

const AdminPayments = () => {
  const { confirm } = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosJWT.get('/api/payments/approvals/pending');
      if (res.data && res.data.success) setItems(res.data.items || []);
    } catch (err) {
      console.error('load approvals', err);
      alert('Lỗi khi tải danh sách duyệt');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    const ok = await confirm({
      title: 'Xác nhận giao dịch',
      message: 'Xác nhận đã nhận tiền và muốn cộng tiền vào ví?',
      confirmText: 'Xác nhận',
    });
    if (!ok) return;
    try {
      const res = await axiosJWT.put(`/api/payments/approvals/${id}/approve`);
      if (res.data && res.data.success) {
        alert('Đã xác nhận thành công');
        load();
      } else {
        alert('Xác nhận thất bại');
      }
    } catch (err) {
      console.error('approve error', err);
      alert('Lỗi khi xác nhận');
    }
  };

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paged = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Box sx={{ p: 2, maxWidth: 1200, mx: 'auto', mt: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Duyệt giao dịch nạp tiền
      </Typography>
      {loading && <Typography sx={{ mb: 1, textAlign: 'center' }}>Đang tải...</Typography>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 16px 0 rgba(8, 127, 114, 0.07)' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f6f8f5' }}>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Người gửi</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Số tiền</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Thời gian</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((it) => (
              <TableRow key={it._id} hover sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: '#e5f3ec' } }}>
                <TableCell align="center">{it.user?.username || it.user?.email || String(it.user)}</TableCell>
                <TableCell align="center">{Number(it.amount || 0).toLocaleString('vi-VN')} VND</TableCell>
                <TableCell align="center">{it.createdAt ? new Date(it.createdAt).toLocaleString('vi-VN') : '—'}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={it.approved ? 'Đã duyệt' : 'Chờ duyệt'}
                    color={it.approved ? 'success' : 'warning'}
                    variant={it.approved ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 600, fontSize: 14, px: 1.25, py: 0.25, borderRadius: 2 }}
                  />
                </TableCell>
                <TableCell align="center">
                  {!it.approved ? (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleApprove(it._id)}
                      sx={{ fontWeight: 700, borderRadius: 2, px: 2, boxShadow: '0 2px 8px 0 rgba(8, 127, 114, 0.10)' }}
                    >
                      Xác nhận
                    </Button>
                  ) : (
                    <Chip label="Đã xử lý" variant="outlined" size="small" sx={{ borderRadius: 2 }} />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: '#888' }}>
                  Không có giao dịch chờ duyệt
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" size="large" />
      </Box>
    </Box>
  );
};

export default AdminPayments;
