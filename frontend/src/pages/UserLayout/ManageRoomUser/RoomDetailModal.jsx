import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardMedia
} from '@mui/material';
import axiosJWT from '../../../config/axiosJWT';

export default function RoomDetailModal({ open, onClose, roomId, roomStatus }) {
  const [tenantData, setTenantData] = useState(null); // { hasTenant, booking }
  const [roomData, setRoomData] = useState(null); // room detail
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && roomId) {
      if (roomStatus === 'rented') fetchTenantInfo();
      else fetchRoomDetail();
    }
    if (!open) {
      setTenantData(null);
      setRoomData(null);
      setError(null);
      setLoading(false);
    }
  }, [open, roomId, roomStatus]);

  const fetchTenantInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosJWT.get(`/api/rooms/${roomId}/tenant`);
      setTenantData(res.data);
    } catch (err) {
      console.error('Lỗi khi tải thông tin người thuê:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Không thể tải thông tin người thuê';
      setError(errorMsg);
    }
    setLoading(false);
  };

  const fetchRoomDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosJWT.get(`/api/rooms/${roomId}`);
      setRoomData(res.data);
    } catch (err) {
      console.error('Lỗi khi tải chi tiết phòng:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Không thể tải chi tiết phòng';
      setError(errorMsg);
    }
    setLoading(false);
  };

  if (!open) return null;

  const booking = tenantData?.booking || null;
  const tenant = booking?.user || null;
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

  const isRented = roomStatus === 'rented';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">{isRented ? 'Thông tin người thuê' : 'Chi tiết phòng'}</Typography>
          <Chip
            label={isRented ? 'Đã thuê' : 'Còn trống'}
            color={isRented ? 'error' : 'success'}
            variant="outlined"
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Lỗi: {error}</Alert>
        ) : isRented ? (
          tenantData?.hasTenant && booking ? (
          <Box>
            <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 700 }}>
              Thông tin khách thuê
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Tên đăng nhập</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{tenant?.username || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{tenant?.email || '—'}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
              Thời gian thuê
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Ngày bắt đầu</Typography>
                <Typography variant="body1">{formatDate(booking.startDate)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Ngày kết thúc</Typography>
                <Typography variant="body1">{formatDate(booking.endDate)}</Typography>
              </Grid>
            </Grid>
          </Box>
          ) : (
            <Alert severity="info">Không tìm thấy người thuê hiện tại của phòng này.</Alert>
          )
        ) : roomData ? (
          <Box>
            <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 700 }}>
              Thông tin phòng
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Loại phòng</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{roomData.roomType || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Giá</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'error.main' }}>
                  {(roomData.price || 0).toLocaleString('vi-VN')} {roomData.unit || 'VND'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Diện tích</Typography>
                <Typography variant="body1">{roomData.area ? `${roomData.area} m²` : '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Phòng ngủ / WC</Typography>
                <Typography variant="body1">{(roomData.beds ?? '—')} / {(roomData.baths ?? '—')}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Địa chỉ</Typography>
                <Typography variant="body1">
                  {[
                    roomData.address,
                    roomData.ward,
                    roomData.district,
                    roomData.province,
                  ].filter(Boolean).join(', ') || '—'}
                </Typography>
              </Grid>
            </Grid>

            {(Array.isArray(roomData.utilities) && roomData.utilities.length > 0) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Tiện ích</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {roomData.utilities.map((u, idx) => (
                    <Chip key={idx} label={u} variant="outlined" color="primary" />
                  ))}
                </Box>
              </>
            )}

            {(Array.isArray(roomData.additionalCosts) && roomData.additionalCosts.length > 0) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Chi phí phát sinh</Typography>
                <Grid container spacing={2}>
                  {roomData.additionalCosts.map((c, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Box sx={{ p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{c?.type || '—'}</Typography>
                        <Typography variant="caption" color="text.secondary">Tần suất: {c?.frequency || '—'}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {roomData.notes && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Ghi chú</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{roomData.notes}</Typography>
              </>
            )}

            {Array.isArray(roomData.images) && roomData.images.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Hình ảnh</Typography>
                <Grid container spacing={2}>
                  {roomData.images.slice(0, 9).map((img, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Card variant="outlined">
                        <CardMedia
                          component="img"
                          height="160"
                          image={img}
                          alt={`img-${idx}`}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/200'; }}
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Box>
        ) : (
          <Alert severity="error">Không thể tải dữ liệu.</Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
