import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import axiosJWT from '../../../config/axiosJWT';

const TopupHistory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [balancesById, setBalancesById] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosJWT.get('/api/payments/history/mine');
      if (res.data && res.data.success) {
        const fetched = res.data.items || [];
        setItems(fetched);

        // compute running balance (consider only completed transactions)
        // sort ascending by date to compute balance over time
        const asc = [...fetched].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        let bal = 0;
        const map = {};
        for (const it of asc) {
          if (it.status === 'completed') {
            if (it.type === 'in') bal += Number(it.amount || 0);
            else bal -= Number(it.amount || 0);
          }
          map[it._id] = bal;
        }
        setBalancesById(map);
      }
    } catch (err) {
      console.error('load topup history', err);
      alert('Lỗi khi tải lịch sử nạp tiền');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Lịch sử nạp tiền</Typography>
      {loading && <Typography>Đang tải...</Typography>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Số tiền</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Nội dung</TableCell>
              <TableCell>Thời gian</TableCell>
              <TableCell>Số dư sau giao dịch</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(it => (
                <TableRow key={it._id}>
                  <TableCell sx={{ fontWeight: 700, color: it.status === 'pending' ? 'text.secondary' : (it.type === 'in' ? 'success.main' : 'error.main') }}>
                    {it.status === 'pending' ? '' : (it.type === 'in' ? '+' : '-')}{Number(it.amount || 0).toLocaleString('vi-VN')} đ
                  </TableCell>
                  <TableCell>{it.type}</TableCell>
                  <TableCell>{it.status}</TableCell>
                  <TableCell style={{ maxWidth: 300, whiteSpace: 'normal' }}>{it.note}</TableCell>
                  <TableCell>{new Date(it.createdAt).toLocaleString()}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{Number(balancesById[it._id] || 0).toLocaleString('vi-VN')} đ</TableCell>
                </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}><Typography sx={{ p: 2 }}>Không có lịch sử nạp tiền</Typography></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TopupHistory;
