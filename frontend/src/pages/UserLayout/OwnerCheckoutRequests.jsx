import React, { useEffect, useState } from 'react';
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
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from '@mui/material';
import checkoutRequestApi from '../../services/api/checkoutRequestApi';

const PAGE_SIZE = 10;

const statusMeta = {
  pending_owner: { color: 'warning', label: 'Chờ chủ trọ', outlined: true },
  pending_admin: { color: 'warning', label: 'Đã xác nhận (chờ admin)', outlined: true },
  rejected_owner: { color: 'error', label: 'Chủ trọ đã từ chối', outlined: false },
  confirmed: { color: 'success', label: 'Đã xác nhận trả phòng', outlined: false },
};

const OwnerCheckoutRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [actionModal, setActionModal] = useState({ open: false, request: null, action: 'approve', ownerNote: '' });

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await checkoutRequestApi.getAllOwner();
      const list = Array.isArray(res.requests) ? res.requests : [];
      setRequests(list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    } catch (err) {
      console.error('OwnerCheckoutRequests fetch error:', err);
      setError('Không thể tải danh sách yêu cầu trả phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openModal = (request, action) => setActionModal({ open: true, request, action, ownerNote: '' });
  const closeModal = () => setActionModal({ open: false, request: null, action: 'approve', ownerNote: '' });

  const handleConfirm = async () => {
    const { request, action, ownerNote } = actionModal;
    if (!request?._id) return;
    try {
      if (action === 'approve') {
        await checkoutRequestApi.approveOwner(request._id, ownerNote);
        alert('Đã xác nhận yêu cầu. Admin sẽ tiếp tục xác nhận và hoàn tiền cọc cho khách.');
      } else {
        await checkoutRequestApi.rejectOwner(request._id, ownerNote);
        alert('Đã từ chối yêu cầu.');
      }
      closeModal();
      fetchRequests();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE));
  const pagedRequests = requests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ width: '100%', marginTop: 32 }}>
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

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 16px 0 rgba(8, 127, 114, 0.07)',
          overflowX: 'auto',
          width: '100%',
        }}
      >
        <Table sx={{ minWidth: 1150 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f6f8f5' }}>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Phòng</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Khách thuê</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Ngày hết hạn</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Ghi chú khách</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Thời gian yêu cầu</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Trạng thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap', minWidth: 180 }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedRequests.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ color: '#888' }}>
                  Chưa có yêu cầu trả phòng nào.
                </TableCell>
              </TableRow>
            )}
            {pagedRequests.map((req) => {
              const meta = statusMeta[req.status] || { color: 'default', label: req.status || '—', outlined: true };
              return (
                <TableRow key={req._id} hover sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: '#e5f3ec' } }}>
                  <TableCell align="center">{req.booking?.room ? (req.booking.room.roomType || req.booking.room.address) : 'N/A'}</TableCell>
                  <TableCell align="center">{req.user?.email || req.user?.username || 'N/A'}</TableCell>
                  <TableCell align="center">{req.booking?.endDate ? new Date(req.booking.endDate).toLocaleDateString('vi-VN') : '—'}</TableCell>
                  <TableCell align="center" sx={{ maxWidth: 220 }}>
                    <Box sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 auto' }}>
                      {req.note || '—'}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{req.createdAt ? new Date(req.createdAt).toLocaleString('vi-VN') : '—'}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={meta.label}
                      color={meta.color}
                      variant={meta.outlined ? 'outlined' : 'filled'}
                      sx={{ fontWeight: 600, fontSize: 14, px: 1.25, py: 0.25, borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {req.status === 'pending_owner' ? (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => openModal(req, 'approve')}
                          sx={{ fontWeight: 700, borderRadius: 2, px: 2, boxShadow: '0 2px 8px 0 rgba(8, 127, 114, 0.10)' }}
                        >
                          Xác nhận
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => openModal(req, 'reject')}
                          sx={{ fontWeight: 700, borderRadius: 2, px: 2 }}
                        >
                          Từ chối
                        </Button>
                      </Box>
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

      <Dialog open={actionModal.open} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionModal.action === 'approve' ? 'Xác nhận trả phòng' : 'Từ chối yêu cầu'} (chủ trọ)
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            Ghi chú cho khách (tùy chọn)
          </Typography>
          <TextField
            multiline
            rows={3}
            placeholder="Nhập ghi chú..."
            fullWidth
            value={actionModal.ownerNote}
            onChange={(e) => setActionModal((p) => ({ ...p, ownerNote: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={closeModal}>Hủy</Button>
          <Button
            variant="contained"
            color={actionModal.action === 'approve' ? 'primary' : 'error'}
            onClick={handleConfirm}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OwnerCheckoutRequests;
