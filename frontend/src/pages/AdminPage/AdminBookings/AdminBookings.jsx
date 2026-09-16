
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useConfirm } from '../../../Components/ConfirmProvider';

import { Box, Modal, Typography } from '@mui/material';

const statusColor = {
  pending: { color: 'warning', label: 'Chờ xác nhận' },
  confirmed: { color: 'success', label: 'Đã xác nhận' },
  cancelled: { color: 'error', label: 'Đã hủy' },
  completed: { color: 'default', label: 'Hoàn thành' },
};

const PAGE_SIZE = 10;

const AdminBookings = () => {
  const { confirm } = useConfirm();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  // Modal state
  const [openDetail, setOpenDetail] = useState(false);
  const [detailData, setDetailData] = useState({ room: null, post: null, owner: null, tenant: null, booking: null });
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosJWT.get('/api/bookings/admin/all');
      const list = Array.isArray(res.data) ? res.data : [];
      setBookings(list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    } catch (err) {
      setError('Không thể tải danh sách đặt phòng');
    } finally {
      setLoading(false);
    }
  };

  // Fetch room detail (kèm chủ trọ + post) và lấy người thuê từ record booking sẵn có
  const handleOpenDetail = async (record) => {
    const roomId = record?.room?._id || record?.roomId || record?.room;
    setDetailLoading(true);
    setDetailError('');
    setOpenDetail(true);
    try {
      // Lấy chi tiết phòng
      const roomRes = roomId ? await axiosJWT.get(`/api/rooms/${roomId}`) : { data: null };
      const room = roomRes?.data || null;
      // roomController.getRoomDetail() đã populate('post') và populate('user') => user là chủ trọ
      setDetailData({
        room,
        post: room?.post || null,
        owner: room?.user || null,
        tenant: record?.user || null,
        booking: record || null,
      });
    } catch (err) {
      setDetailError('Không thể tải chi tiết phòng.');
      setDetailData({ room: null, post: null, owner: null, tenant: null, booking: null });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setDetailData({ room: null, post: null, owner: null, tenant: null, booking: null });
    setDetailError('');
  };

  const handleConfirm = async (bookingId) => {
    try {
      await axiosJWT.put(`/api/bookings/admin/${bookingId}/confirm`);
      alert('Đã xác nhận thanh toán. User có thể sử dụng phòng.');
      fetchBookings();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (bookingId) => {
    const ok = await confirm({
      title: 'Xác nhận từ chối',
      message: 'Bạn chắc chắn muốn từ chối yêu cầu thuê phòng này? Phòng sẽ hiển thị lại trên hệ thống trong khoảng thời gian đã đặt.',
      confirmText: 'Từ chối',
    });
    if (!ok) return;
    try {
      await axiosJWT.put(`/api/bookings/admin/${bookingId}/reject`);
      alert('Đã từ chối. Phòng sẽ hiển thị lại trên hệ thống trong khoảng thời gian đó.');
      fetchBookings();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Pagination logic (frontend only)
  const totalPages = Math.max(1, Math.ceil(bookings.length / PAGE_SIZE));
  const pagedBookings = bookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', marginTop: 32 }}>
      {error && <div style={{ color: '#d32f2f', background: '#fff3f3', borderRadius: 8, padding: 12, marginBottom: 16, textAlign: 'center' }}>{error}</div>}
      {loading && <div style={{ marginBottom: 12, textAlign: 'center' }}>Đang tải...</div>}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 16px 0 rgba(8, 127, 114, 0.07)' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f6f8f5' }}>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Phòng</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Người đặt</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Ngày bắt đầu</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Ngày kết thúc</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedBookings.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: '#888' }}>Chưa có đơn đặt phòng nào.</TableCell>
              </TableRow>
            )}
            {pagedBookings.map((record) => (
              <TableRow key={record._id} hover sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: '#e5f3ec' } }}>
                <TableCell align="center">{record.room ? (record.room.roomType || record.room.address) : 'N/A'}</TableCell>
                <TableCell align="center">{record.user ? (record.user.email || record.user.username) : 'N/A'}</TableCell>
                <TableCell align="center">{record.startDate ? new Date(record.startDate).toLocaleDateString('vi-VN') : '—'}</TableCell>
                <TableCell align="center">{record.endDate ? new Date(record.endDate).toLocaleDateString('vi-VN') : '—'}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={statusColor[record.status]?.label || record.status}
                    color={statusColor[record.status]?.color || 'default'}
                    variant={record.status === 'pending' ? 'outlined' : 'filled'}
                    sx={{ fontWeight: 600, fontSize: 15, px: 1.5, py: 0.5, borderRadius: 2 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {record.status === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleConfirm(record._id)}
                          sx={{ fontWeight: 700, borderRadius: 2, px: 2, boxShadow: '0 2px 8px 0 rgba(8, 127, 114, 0.10)' }}
                        >
                          Xác nhận thanh toán
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => handleReject(record._id)}
                          sx={{ fontWeight: 700, borderRadius: 2, px: 2 }}
                        >
                          Từ chối
                        </Button>
                      </Box>
                    )}
                    <Button
                      variant="outlined"
                      color="info"
                      size="small"
                      onClick={() => handleOpenDetail(record)}
                      sx={{ fontWeight: 600, borderRadius: 2, px: 2 }}
                    >
                      Xem chi tiết
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Pagination */}
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
    {/* Modal chi tiết phòng và bài đăng */}
    <Modal open={openDetail} onClose={handleCloseDetail}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#fff', boxShadow: 24, p: 4, borderRadius: 4, minWidth: 400, maxWidth: 650, width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, textAlign: 'center', color: '#087f72' }}>Chi tiết phòng & bài đăng</Typography>
        {detailLoading ? (
          <Typography>Đang tải...</Typography>
        ) : detailError ? (
          <Typography color="error">{detailError}</Typography>
        ) : (
          <>
            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 700, color: '#087f72' }}>Thông tin người tham gia:</Typography>
            <Box sx={{ mb: 2, mt: 1 }}>
              <div style={{ marginBottom: 6 }}>
                <b>Chủ trọ:</b>{' '}
                {detailData.owner
                  ? (detailData.owner.username || detailData.owner.email || detailData.owner.phone || '—')
                  : '—'}
              </div>
              <div style={{ marginBottom: 6 }}>
                <b>Người thuê:</b>{' '}
                {detailData.tenant
                  ? (detailData.tenant.username || detailData.tenant.email || detailData.tenant.phone || '—')
                  : '—'}
              </div>
              <div style={{ marginBottom: 6 }}>
                <b>Thời gian đặt:</b>{' '}
                {detailData.booking?.startDate
                  ? new Date(detailData.booking.startDate).toLocaleDateString('vi-VN')
                  : '—'}{' '}
                -{' '}
                {detailData.booking?.endDate
                  ? new Date(detailData.booking.endDate).toLocaleDateString('vi-VN')
                  : '—'}
              </div>
            </Box>

            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 700, color: '#087f72' }}>Chi tiết phòng:</Typography>
            {detailData.room ? (
              <Box sx={{ mb: 2 }}>
                <div style={{ marginBottom: 4 }}><b>Loại phòng:</b> {detailData.room.roomType}</div>
                <div style={{ marginBottom: 4 }}><b>Địa chỉ:</b> {detailData.room.address}</div>
                <div style={{ marginBottom: 8 }}><b>Giá:</b> {detailData.room.price} VNĐ</div>
                <div style={{ marginBottom: 4 }}><b>Diện tích:</b> {detailData.room.area || '—'} m²</div>
                <div style={{ marginBottom: 4 }}><b>Phòng ngủ/WC:</b> {detailData.room.beds ?? '—'} / {detailData.room.baths ?? '—'}</div>
                {/* Hiển thị ảnh phòng */}
                {Array.isArray(detailData.room.images) && detailData.room.images.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 1, overflowX: 'auto', pb: 1 }}>
                    {detailData.room.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`room-img-${idx}`}
                        style={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 8, border: '2px solid #e3e3e3', marginRight: 8, transition: 'transform 0.2s', cursor: 'pointer' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            ) : <Typography color="text.secondary">Không có dữ liệu phòng.</Typography>}
          </>
        )}
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button onClick={handleCloseDetail} variant="contained" color="secondary" sx={{ fontWeight: 700, px: 4, py: 1, borderRadius: 2 }}>Đóng</Button>
        </Box>
      </Box>
    </Modal>
  </div>
  );
};

export default AdminBookings;
