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
  Button,
  Pagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { getPendingWithdrawalsAdmin, approveWithdrawalAdmin, rejectWithdrawalAdmin } from '../../../services/api/withdrawalApi';
import { useToast } from '../../../Components/ToastProvider';

const COMMISSION_PERCENT = 10;

const AdminWithdrawals = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState(null);
  const [approving, setApproving] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPendingWithdrawalsAdmin();
      setList(res?.list || []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách yêu cầu rút tiền');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleApproveClick = (row) => {
    setApproveTarget(row);
    setApproveModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!approveTarget?._id) return;
    setApproving(true);
    try {
      await approveWithdrawalAdmin(approveTarget._id);
      showToast('Đã xác nhận rút tiền. Số dư chủ phòng đã được trừ.', 'success');
      setApproveModalOpen(false);
      setApproveTarget(null);
      fetchList();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Lỗi khi xác nhận', 'error');
    } finally {
      setApproving(false);
    }
  };

  const handleRejectClick = (id) => {
    setRejectTargetId(id);
    setRejectNote('');
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectTargetId) return;
    setRejecting(true);
    try {
      await rejectWithdrawalAdmin(rejectTargetId, rejectNote.trim() || undefined);
      showToast('Đã từ chối yêu cầu', 'success');
      setRejectModalOpen(false);
      setRejectTargetId(null);
      setRejectNote('');
      fetchList();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Lỗi khi từ chối', 'error');
    } finally {
      setRejecting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Quản lý rút tiền
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      )}
      {loading && <Typography color="text.secondary">Đang tải...</Typography>}
      {(() => {
        const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
        const paged = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

        return (
          <>
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 16px 0 rgba(25, 118, 210, 0.07)' }}>
              <Table size="small">
          <TableHead>
                <TableRow sx={{ bgcolor: '#f4f6fb' }}>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Chủ phòng</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Số tiền rút</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Chiết khấu 10%</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Chuyển cho chủ phòng</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Tên TK / Số TK</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Hành động</TableCell>
                </TableRow>
          </TableHead>
          <TableBody>
            {!loading && list.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Chưa có yêu cầu rút tiền nào chờ xử lý.
                </TableCell>
              </TableRow>
            )}
            {paged.map((row) => {
              const amount = Number(row.amount || 0);
              const commission = Math.floor((amount * COMMISSION_PERCENT) / 100);
              const receive = amount - commission;
              return (
                <TableRow key={row._id} hover sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: '#e3f2fd' } }}>
                  <TableCell align="center">
                    {row.user?.username || row.user?.email || row.user?._id || '—'}
                  </TableCell>
                  <TableCell align="center">{amount.toLocaleString('vi-VN')} đ</TableCell>
                  <TableCell align="center">{commission.toLocaleString('vi-VN')} đ</TableCell>
                  <TableCell align="center">{receive.toLocaleString('vi-VN')} đ</TableCell>
                  <TableCell align="center">
                    {row.bankAccountName || '—'} / {row.bankAccountNumber || '—'}
                  </TableCell>
                  <TableCell align="center">
                    {row.createdAt
                      ? new Date(row.createdAt).toLocaleString('vi-VN')
                      : '—'}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      sx={{ mr: 1 }}
                      onClick={() => handleApproveClick(row)}
                    >
                      Xác nhận
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleRejectClick(row._id)}
                    >
                      Từ chối
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
                color="primary"
                shape="rounded"
                size="large"
              />
            </Box>
          </>
        );
      })()}

      <Dialog open={approveModalOpen} onClose={() => !approving && setApproveModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Xác nhận duyệt rút tiền</DialogTitle>
        <DialogContent>
          {approveTarget && (
            <Typography>
              Bạn chắc chắn duyệt yêu cầu rút tiền <strong>{(Number(approveTarget.amount) || 0).toLocaleString('vi-VN')} đ</strong> của chủ phòng? Số dư ví sẽ bị trừ tương ứng.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveModalOpen(false)} disabled={approving}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleApproveConfirm} disabled={approving}>
            {approving ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectModalOpen} onClose={() => !rejecting && setRejectModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Lý do từ chối (tùy chọn)</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Lý do từ chối"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Nhập lý do từ chối để thông báo cho chủ phòng..."
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectModalOpen(false)} disabled={rejecting}>Đóng</Button>
          <Button variant="contained" color="error" onClick={handleRejectConfirm} disabled={rejecting}>
            {rejecting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminWithdrawals;
