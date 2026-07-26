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
import { Box } from '@mui/material';
import { Modal, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import earlyCheckoutApi from '../../../services/api/earlyCheckoutApi';

const AdminEarlyCheckout = () => {
  const [earlyCheckoutRequests, setEarlyCheckoutRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminReplyModal, setAdminReplyModal] = useState({ show: false, requestId: null, action: null, adminNote: '' });
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;
  const statusMeta = {
    pending: { color: 'warning', label: 'Chờ xử lý' },
    approved: { color: 'success', label: 'Đã phê duyệt' },
    rejected: { color: 'error', label: 'Đã từ chối' },
  };

  useEffect(() => {
    fetchEarlyCheckoutRequests();
  }, []);

  const fetchEarlyCheckoutRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await earlyCheckoutApi.getAllRequests();
      const list = Array.isArray(res.requests) ? res.requests : [];
      setEarlyCheckoutRequests(list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    } catch (err) {
      console.error('Early checkout requests fetch error:', err);
      setError('Không thể tải danh sách yêu cầu trả phòng sớm');
    } finally {
      setLoading(false);
    }
  };

  const openAdminReplyModal = (requestId, action) => {
    setAdminReplyModal({ show: true, requestId, action, adminNote: '' });
  };

  const handleConfirmAdminReply = async () => {
    const { requestId, action, adminNote } = adminReplyModal;
    if (!requestId || !action) return;
    try {
      if (action === 'approve') {
        await earlyCheckoutApi.approveRequest(requestId, adminNote);
        alert('Đã phê duyệt yêu cầu trả phòng sớm. Phản hồi đã gửi tới user.');
      } else {
        await earlyCheckoutApi.rejectRequest(requestId, adminNote);
        alert('Đã từ chối yêu cầu. Phản hồi đã gửi tới user.');
      }
      setAdminReplyModal({ show: false, requestId: null, action: null, adminNote: '' });
      fetchEarlyCheckoutRequests();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApproveEarlyCheckout = (requestId) => openAdminReplyModal(requestId, 'approve');
  const handleRejectEarlyCheckout = (requestId) => openAdminReplyModal(requestId, 'reject');

  const totalPages = Math.max(1, Math.ceil(earlyCheckoutRequests.length / PAGE_SIZE));
  const paged = earlyCheckoutRequests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
              <TableCell align="center" sx={{ fontWeight: 700 }}>Người yêu cầu</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Ngày trả dự kiến</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Lý do</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Tiền hoàn</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Phí phạt</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Thời gian</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Phản hồi admin</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ color: '#888' }}>
                  Chưa có yêu cầu trả phòng sớm nào.
                </TableCell>
              </TableRow>
            )}
            {paged.map((request) => {
              const meta = statusMeta[request.status] || { color: 'default', label: request.status || '—' };
              return (
                <TableRow key={request._id} hover sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: '#e3f2fd' } }}>
                  <TableCell align="center">
                    {request.booking?.room ? (request.booking.room.roomType || request.booking.room.address) : 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    {request.user?.email ||
                      request.user?.name ||
                      request.user?.username ||
                      request.booking?.user?.email ||
                      request.booking?.user?.username ||
                      'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    {request.requestedCheckoutDate ? new Date(request.requestedCheckoutDate).toLocaleDateString('vi-VN') : '—'}
                  </TableCell>
                  <TableCell align="center" sx={{ maxWidth: 220 }}>
                    <Box sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 auto' }}>
                      {request.reason || '—'}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{(request.refundAmount ?? 0).toLocaleString('vi-VN')} VND</TableCell>
                  <TableCell align="center">{(request.penaltyFee ?? 0).toLocaleString('vi-VN')} VND</TableCell>
                  <TableCell align="center">
                    {request.createdAt ? new Date(request.createdAt).toLocaleString('vi-VN') : '—'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={meta.label}
                      color={meta.color}
                      variant={request.status === 'pending' ? 'outlined' : 'filled'}
                      sx={{ fontWeight: 600, fontSize: 14, px: 1.25, py: 0.25, borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ maxWidth: 240 }}>
                    <Box sx={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 auto' }}>
                      {request.adminNote || '—'}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {request.status === 'pending' ? (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleApproveEarlyCheckout(request._id)}
                          sx={{ fontWeight: 700, borderRadius: 2, px: 2, boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.10)' }}
                        >
                          Phê duyệt
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleRejectEarlyCheckout(request._id)}
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

      <Modal show={adminReplyModal.show} onHide={() => setAdminReplyModal({ show: false, requestId: null, action: null, adminNote: '' })} centered>
        <Modal.Header closeButton>
          <Modal.Title>{adminReplyModal.action === 'approve' ? 'Phê duyệt' : 'Từ chối'} – Phản hồi cho user</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Phản hồi / Lý do (user sẽ xem được)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Nhập phản hồi hoặc lý do để user biết..."
              value={adminReplyModal.adminNote}
              onChange={(e) => setAdminReplyModal(prev => ({ ...prev, adminNote: e.target.value }))}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outlined" color="inherit" onClick={() => setAdminReplyModal({ show: false, requestId: null, action: null, adminNote: '' })}>
            Hủy
          </Button>
          <Button variant="contained" color={adminReplyModal.action === 'approve' ? 'primary' : 'error'} onClick={handleConfirmAdminReply}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminEarlyCheckout;
