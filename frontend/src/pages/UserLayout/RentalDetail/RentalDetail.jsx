import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getMyBookingById } from '../../../services/api/bookingApi';

const statusText = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', cancelled: 'Đã hủy', completed: 'Đã hoàn thành' };
const statusColor = { pending: 'warning', confirmed: 'success', cancelled: 'error', completed: 'default' };
const billingCycleText = { daily: 'Theo ngày', monthly: 'Theo tháng' };

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

const RentalDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((s) => s?.auth?.login?.currentUser);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const myUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      if (!bookingId) {
        setError('Thiếu mã đơn thuê');
        setLoading(false);
        return;
      }
      try {
        const res = await getMyBookingById(bookingId);
        if (!cancelled && res?.success && res?.booking) setBooking(res.booking);
        else if (!cancelled) setError('Không tìm thấy đơn thuê');
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || 'Không tải được thông tin thuê phòng');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [bookingId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !booking) {
    return (
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', py: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error || 'Không tìm thấy đơn thuê'}</Alert>
        <Button variant="outlined" onClick={() => navigate('/user/my-rentals')}>Quay lại Phòng đã thuê</Button>
      </Box>
    );
  }

  const room = booking.room || {};
  const roomOwner =
    typeof room.user === 'string'
      ? room.user
      : room.user?._id || room.user?.id || '';

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Chi tiết thuê phòng
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate('/user/my-rentals')}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Quay lại Phòng đã thuê
        </Button>
      </Box>

      <Table
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 16px 0 rgba(25, 118, 210, 0.07)',
          overflow: 'hidden',
        }}
      >
        <TableHead>
          <TableRow sx={{ bgcolor: '#f4f6fb' }}>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Phòng</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Người thuê</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Ngày bắt đầu</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Ngày kết thúc</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Chu kỳ thanh toán</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Giá phòng</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell align="center">
              <Typography variant="body2" fontWeight={600}>
                {room.title || room.address || 'Phòng trọ'}
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="body2" color="text.secondary">
                {currentUser?.email || currentUser?.username || 'Bạn'}
              </Typography>
            </TableCell>
            <TableCell align="center">
              {formatDate(booking.startDate)}
            </TableCell>
            <TableCell align="center">
              {formatDate(booking.endDate)}
            </TableCell>
            <TableCell align="center">
              {billingCycleText[booking.billingCycle] || booking.billingCycle || '—'}
            </TableCell>
            <TableCell align="center">
              {room.price != null ? `${Number(room.price).toLocaleString('vi-VN')} đ/tháng` : '—'}
            </TableCell>
            <TableCell align="center">
              <Chip
                size="small"
                label={statusText[booking.status] || booking.status}
                color={statusColor[booking.status] || 'default'}
                variant="outlined"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Paper
        variant="outlined"
        sx={{
          mt: 3,
          borderRadius: 3,
          padding: 2,
          bgcolor: '#f9fafc',
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
          Thông tin bổ sung
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ width: 220, fontWeight: 600, color: 'text.secondary' }}>Mã đơn thuê</TableCell>
              <TableCell>{booking._id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Ngày tạo đơn</TableCell>
              <TableCell>{formatDate(booking.createdAt)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate(`/room/${room._id}`)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Xem thông tin phòng
        </Button>
        {booking.status === 'confirmed' && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const roomId = room._id || room.id;
              if (!roomId || !roomOwner) {
                alert('Không xác định được chủ phòng để bắt đầu trò chuyện.');
                return;
              }
              if (String(roomOwner) === String(myUserId)) {
                alert('Bạn không thể nhắn tin với chính mình.');
                return;
              }
              navigate(
                `/user/chat?roomId=${encodeURIComponent(String(roomId))}&ownerId=${encodeURIComponent(String(roomOwner))}`
              );
            }}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Liên hệ chủ nhà
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default RentalDetail;
