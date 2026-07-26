import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import axiosJWT from '../../config/axiosJWT';
import { useNavigate } from 'react-router-dom';

export default function IsLandorStatus() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosJWT.get('/api/payments/islandor');
        if (!mounted) return;
        if (res.data && res.data.success) {
          setData(res.data);
        } else {
          setData({ success: false });
        }
      } catch (err) {
        console.error('load IsLandor status error', err);
        if (mounted) setData({ success: false });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const formatRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const exp = new Date(expiresAt);
    const diff = exp - now;
    if (diff <= 0) return { expired: true, text: 'Đã hết hạn' };
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const parts = [];
    if (days > 0) parts.push(`${days} ngày`);
    if (hours > 0) parts.push(`${hours} giờ`);
    if (parts.length === 0) parts.push('dưới 1 giờ');
    return { expired: false, text: parts.join(' ') };
  };

  const onRenew = () => {
    navigate('/user/pricing');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" mb={2}>Tình trạng gói dịch vụ</Typography>
      <Paper sx={{ p: 2, maxWidth: 680 }} elevation={1}>
        {loading ? (
          <Typography>Đang tải...</Typography>
        ) : (
          <>
            {data && data.isActive ? (
              <Box>
                <Typography sx={{ mb: 1 }}>Gói đang hoạt động</Typography>
                <Typography variant="body2">Hạn sử dụng: {new Date(data.expiresAt).toLocaleString('vi-VN')}</Typography>
                <Typography variant="body1" sx={{ mt: 1, fontWeight: 700 }}>{formatRemaining(data.expiresAt).text} còn lại</Typography>
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" color="primary" onClick={onRenew}>Gia hạn / Mua thêm</Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" sx={{ mb: 1 }}>Bạn hiện chưa có gói dịch vụ hoặc gói đã hết hạn.</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>Gói dịch vụ sẽ cho phép bạn đăng tin cho thuê và nhận nhiều tính năng khác.</Typography>
                <Button variant="contained" color="primary" onClick={onRenew}>Xem gói và mua</Button>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
