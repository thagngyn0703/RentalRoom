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
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { getMyWithdrawals, cancelWithdrawal } from '../../../services/api/withdrawalApi';
import { useToast } from '../../../Components/ToastProvider';

const statusLabel = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối', cancelled: 'Đã hủy' };

const WithdrawalHistory = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [withdrawalToCancel, setWithdrawalToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const { showToast } = useToast();

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getMyWithdrawals();
      setList(res?.list || []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleConfirmCancel = async () => {
    if (!withdrawalToCancel?._id) return;
    setCancelling(true);
    try {
      await cancelWithdrawal(withdrawalToCancel._id);
      showToast('Đã hủy yêu cầu rút tiền', 'success');
      setCancelModalOpen(false);
      setWithdrawalToCancel(null);
      fetchList();
      window.dispatchEvent(new Event('walletUpdated'));
    } catch (err) {
      showToast(err?.response?.data?.message || 'Hủy thất bại', 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 640, mx: 'auto', py: 0 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Lịch sử yêu cầu rút tiền
      </Typography>

      <Paper
        variant="outlined"
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <TableContainer>
          <Table size="medium" sx={{ minWidth: 360 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 1.5 }}>Số tiền</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 1.5 }}>Tài khoản</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 1.5 }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 1.5 }}>Thời gian</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', py: 1.5 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Đang tải...
                  </TableCell>
                </TableRow>
              )}
              {!loading && list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    <Typography variant="body2">Chưa có yêu cầu rút tiền nào</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!loading && list.map((row) => (
                <TableRow
                  key={row._id}
                  hover
                  sx={{
                    '&:last-child td': { borderBottom: 0 },
                  }}
                >
                  <TableCell sx={{ py: 1.75 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {(Number(row.amount) || 0).toLocaleString('vi-VN')} đ
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.75 }}>
                    <Typography variant="body2" color="text.secondary">
                      {row.bankAccountName} / {row.bankAccountNumber}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.75 }}>
                    <Chip
                      size="small"
                      label={statusLabel[row.status] || row.status}
                      color={row.status === 'approved' ? 'success' : row.status === 'pending' ? 'warning' : 'default'}
                      variant="outlined"
                      sx={{
                        fontWeight: 500,
                        borderColor:
                          row.status === 'approved'
                            ? 'success.light'
                            : row.status === 'pending'
                            ? 'warning.light'
                            : undefined,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1.75 }}>
                    <Typography variant="body2" color="text.secondary">
                      {row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.75 }}>
                    {row.status === 'pending' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => { setWithdrawalToCancel(row); setCancelModalOpen(true); }}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Hủy
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={cancelModalOpen}
        onClose={() => !cancelling && setCancelModalOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận hủy yêu cầu rút tiền</DialogTitle>
        <DialogContent>
          {withdrawalToCancel && (
            <Typography color="text.secondary">
              Bạn có chắc muốn hủy yêu cầu rút tiền{' '}
              <Typography component="span" fontWeight={700} color="text.primary">
                {(Number(withdrawalToCancel.amount) || 0).toLocaleString('vi-VN')} đ
              </Typography>
              ?
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelModalOpen(false)} disabled={cancelling} sx={{ textTransform: 'none' }}>
            Không
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmCancel}
            disabled={cancelling}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {cancelling ? 'Đang xử lý...' : 'Hủy yêu cầu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WithdrawalHistory;
