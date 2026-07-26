import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import axiosJWT from '../../config/axiosJWT';

const statusMeta = {
  completed: { label: 'Đã xác nhận', color: 'success' },
  pending: { label: 'Chờ admin xác nhận', color: 'warning' },
  failed: { label: 'Thất bại', color: 'error' },
};

const OwnerPaymentHistory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosJWT.get('/api/payments/history/owner-rentals');
      if (res.data?.success) {
        setItems(Array.isArray(res.data.items) ? res.data.items : []);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('load owner rental payment history error', err);
      alert('Lỗi khi tải lịch sử thanh toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Lịch sử thanh toán thuê phòng
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Danh sách các lần người thuê chuyển khoản thanh toán tiền thuê phòng cho admin, thuộc các phòng của bạn.
      </Typography>
      {loading && <Typography sx={{ mb: 1 }}>Đang tải...</Typography>}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Người thuê</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Phòng</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Kỳ thuê</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Số tiền</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Thời gian chuyển khoản</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it) => {
              const meta = statusMeta[it.status] || { label: it.status || 'Không xác định', color: 'default' };
              return (
                <TableRow key={`${it.bookingId}-${it.paidAt}`}>
                  <TableCell>{it.tenant?.username || it.tenant?.email || 'Người thuê'}</TableCell>
                  <TableCell>{it.room?.title || it.room?.roomType || it.room?.address || 'Phòng trọ'}</TableCell>
                  <TableCell>
                    {it.bookingStartDate ? new Date(it.bookingStartDate).toLocaleDateString('vi-VN') : '—'} -{' '}
                    {it.bookingEndDate ? new Date(it.bookingEndDate).toLocaleDateString('vi-VN') : '—'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {Number(it.amount || 0).toLocaleString('vi-VN')} đ
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={meta.label}
                      color={meta.color}
                      variant={it.status === 'completed' ? 'filled' : 'outlined'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {it.paidAt ? new Date(it.paidAt).toLocaleString('vi-VN') : '—'}
                  </TableCell>
                </TableRow>
              );
            })}
            {items.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography sx={{ p: 2, color: 'text.secondary' }}>
                    Chưa có lịch sử thanh toán thuê phòng.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OwnerPaymentHistory;
