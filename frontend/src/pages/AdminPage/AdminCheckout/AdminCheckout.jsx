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
import checkoutRequestApi from '../../../services/api/checkoutRequestApi';

const AdminCheckout = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState({ show: false, request: null, adminNote: '' });
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await checkoutRequestApi.getAllAdmin();
      const list = Array.isArray(res.requests) ? res.requests : [];
      setRequests(list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    } catch (err) {
      console.error('AdminCheckout fetch error:', err);
      setError('Không thể tải danh sách yêu cầu trả phòng');
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (request) => setConfirmModal({ show: true, request, adminNote: '' });
  const closeConfirmModal = () => setConfirmModal({ show: false, request: null, adminNote: '' });

  const handleConfirmCheckout = async () => {
    const { request, adminNote } = confirmModal;
    if (!request?._id) return;
    try {
      await checkoutRequestApi.confirmAdmin(request._id, adminNote);
      alert('Đã xác nhận trả phòng. Tiền cọc (trừ phí trả trễ nếu có) đã được chuyển vào ví khách.');
      closeConfirmModal();
      fetchRequests();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Dự kiến phí trả trễ: từ endDate đến hôm nay, quá 1 ngày thì mỗi ngày = giá/30
  const getPredictedLateFee = (req) => {
    const booking = req.booking;
    if (!booking?.endDate || !booking?.room?.price) return { days: 0, amount: 0 };
    const endDate = new Date(booking.endDate);
    endDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffMs = today - endDate;
    const daysOverdue = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    if (daysOverdue <= 1) return { days: 0, amount: 0 };
    const lateDays = daysOverdue - 1;
    const pricePerDay = (booking.room.price || 0) / 30;
    return { days: lateDays, amount: Math.round(lateDays * pricePerDay) };
  };

  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE));
  const paged = requests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
          boxShadow: '0 2px 16px 0 rgba(25, 118, 210, 0.07)',
          overflowX: 'auto',
          width: '100%',
        }}
      >
        <Table sx={{ minWidth: 1400 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f4f6fb' }}>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Phòng</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Người yêu cầu</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Ngày hết hạn</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Ghi chú khách</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Ghi chú chủ trọ</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Thời gian</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Trạng thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Phí trả trễ</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Phản hồi admin</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap', minWidth: 180 }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ color: '#888' }}>
                  Chưa có yêu cầu trả phòng nào.
                </TableCell>
              </TableRow>
            )}
            {paged.map((req) => {
              const predicted = req.status === 'pending_admin' ? getPredictedLateFee(req) : null;
              const lateFeeDisplay = req.status === 'confirmed'
                ? (req.lateFeeDays > 0 ? `${req.lateFeeDays} ngày, ${(req.lateFeeAmount || 0).toLocaleString('vi-VN')} đ` : '0')
                : (predicted && predicted.days > 0 ? `Dự kiến: ${predicted.days} ngày, ${predicted.amount.toLocaleString('vi-VN')} đ` : '0');
              const statusLabel = req.status === 'pending_admin' ? 'Chờ admin xác nhận' : 'Đã xác nhận';
              const statusColor = req.status === 'pending_admin' ? 'warning' : 'success';

              return (
                <TableRow key={req._id} hover sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: '#e3f2fd' } }}>
                  <TableCell align="center">{req.booking?.room ? (req.booking.room.roomType || req.booking.room.address) : 'N/A'}</TableCell>
                  <TableCell align="center">{req.user?.email || req.user?.username || req.booking?.user?.email || 'N/A'}</TableCell>
                  <TableCell align="center">{req.booking?.endDate ? new Date(req.booking.endDate).toLocaleDateString('vi-VN') : '—'}</TableCell>
                  <TableCell align="center" sx={{ maxWidth: 200 }}>
                    <Box sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 auto' }}>
                      {req.note || '—'}
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ maxWidth: 200 }}>
                    <Box sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 auto' }}>
                      {req.ownerNote || '—'}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{req.createdAt ? new Date(req.createdAt).toLocaleString('vi-VN') : '—'}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={statusLabel}
                      color={statusColor}
                      variant={req.status === 'pending_admin' ? 'outlined' : 'filled'}
                      sx={{ fontWeight: 600, fontSize: 14, px: 1.25, py: 0.25, borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell align="center">{lateFeeDisplay}</TableCell>
                  <TableCell align="center" sx={{ maxWidth: 200 }}>
                    <Box sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 auto' }}>
                      {req.adminNote || '—'}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {req.status === 'pending_admin' ? (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => openConfirmModal(req)}
                        sx={{ fontWeight: 700, borderRadius: 2, px: 2, boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.10)' }}
                      >
                        Xác nhận trả phòng
                      </Button>
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

      <Modal show={confirmModal.show} onHide={closeConfirmModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận trả phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmModal.request && (
            <>
              <p>Xác nhận khách đã trả phòng. Hệ thống sẽ tính phí trả trễ (nếu quá hạn) và <strong>hoàn tiền cọc vào ví khách</strong> = tiền cọc − phí trả trễ (không quá hạn thì hoàn full cọc).</p>
              {confirmModal.request.note && (
                <div className="mb-3">
                  <div className="fw-bold">Ghi chú từ khách</div>
                  <div className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{confirmModal.request.note}</div>
                </div>
              )}
              {confirmModal.request.ownerNote && (
                <div className="mb-3">
                  <div className="fw-bold">Ghi chú từ chủ trọ</div>
                  <div className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{confirmModal.request.ownerNote}</div>
                </div>
              )}
              {(() => {
                const req = confirmModal.request;
                const deposit = Number(req.booking?.depositAmount ?? req.booking?.room?.price ?? 0);
                const predicted = getPredictedLateFee(req);
                const refund = Math.max(0, deposit - (predicted?.amount ?? 0));
                return (
                  <div className="mb-3 p-3 bg-light rounded">
                    <div className="mb-1"><strong>Tiền cọc:</strong> {deposit.toLocaleString('vi-VN')} đ</div>
                    <div className="mb-1"><strong>Phí trả trễ (dự kiến):</strong> {(predicted?.amount ?? 0).toLocaleString('vi-VN')} đ {predicted?.days > 0 ? `(${predicted.days} ngày)` : ''}</div>
                    <div className="mb-0 fw-bold text-primary"><strong>Số tiền cọc cần trả khách:</strong> {refund.toLocaleString('vi-VN')} đ</div>
                  </div>
                );
              })()}
              <Form.Group className="mb-2">
                <Form.Label>Ghi chú (tùy chọn)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Ghi chú cho khách..."
                  value={confirmModal.adminNote}
                  onChange={(e) => setConfirmModal(prev => ({ ...prev, adminNote: e.target.value }))}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outlined" color="inherit" onClick={closeConfirmModal}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleConfirmCheckout}>Xác nhận trả phòng</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminCheckout;
