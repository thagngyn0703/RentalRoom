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
import extendPaymentApi from '../../services/api/extendPaymentApi';
import { useConfirm } from '../../Components/ConfirmProvider';

const PAGE_SIZE = 10;

const statusMeta = {
  pending_owner: { color: 'warning', label: 'Chờ chủ trọ', outlined: true },
  approved_owner: { color: 'success', label: 'Đã xác nhận gia hạn', outlined: false },
  rejected_owner: { color: 'error', label: 'Chủ trọ đã từ chối', outlined: false },
};

const OwnerExtendRequests = () => {
  const { confirm } = useConfirm();
  const [extendRequests, setExtendRequests] = useState([]);
  const [extendLoading, setExtendLoading] = useState(false);
  const [extendError, setExtendError] = useState('');
  const [page, setPage] = useState(1);

  const fetchExtendRequests = async () => {
    setExtendLoading(true);
    setExtendError('');
    try {
      const res = await extendPaymentApi.getOwnerPending();
      const list = Array.isArray(res.requests) ? res.requests : [];
      setExtendRequests(list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    } catch (err) {
      console.error('OwnerExtendRequests fetch error:', err);
      setExtendError('Không thể tải yêu cầu gia hạn thuê');
      setExtendRequests([]);
    } finally {
      setExtendLoading(false);
    }
  };

  useEffect(() => {
    fetchExtendRequests();
  }, []);

  const handleApproveExtend = async (historyId) => {
    try {
      await extendPaymentApi.approveOwner(historyId);
      fetchExtendRequests();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRejectExtend = async (historyId) => {
    const ok = await confirm({
      title: 'Từ chối gia hạn',
      message: 'Bạn có chắc muốn từ chối yêu cầu gia hạn thuê này không?',
      confirmText: 'Từ chối',
      cancelText: 'Hủy',
    });
    if (!ok) return;
    try {
      await extendPaymentApi.rejectOwner(historyId);
      fetchExtendRequests();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const totalPages = Math.max(1, Math.ceil(extendRequests.length / PAGE_SIZE));
  const pagedRequests = extendRequests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ width: '100%', marginTop: 32 }}>
      {extendError && (
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
          {extendError}
        </div>
      )}
      {extendLoading && <div style={{ marginBottom: 12, textAlign: 'center' }}>Đang tải...</div>}

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 16px 0 rgba(25, 118, 210, 0.07)',
          overflowX: 'auto',
          width: '100%',
        }}
      >
        <Table sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f4f6fb' }}>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Phòng</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Khách thuê</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Số tháng</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Ngày gia hạn đến</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Số tiền</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap', minWidth: 180 }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedRequests.length === 0 && !extendLoading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: '#888' }}>
                  Chưa có yêu cầu gia hạn nào.
                </TableCell>
              </TableRow>
            )}
            {pagedRequests.map((r) => {
              const meta = statusMeta[r.extendOwnerStatus] || { color: 'default', label: 'Đã xử lý', outlined: true };
              return (
                <TableRow key={r.historyId} hover sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: '#e3f2fd' } }}>
                  <TableCell align="center">{r.booking?.room ? (r.booking.room.roomType || r.booking.room.address) : 'N/A'}</TableCell>
                  <TableCell align="center">{r.user?.email || r.user?.username || 'N/A'}</TableCell>
                  <TableCell align="center">{r.monthsToAdd || 0}</TableCell>
                  <TableCell align="center">{r.newEndDate ? new Date(r.newEndDate).toLocaleDateString('vi-VN') : '—'}</TableCell>
                  <TableCell align="center">{(r.amount || 0).toLocaleString('vi-VN')} VND</TableCell>
                  <TableCell align="center">
                    {r.extendOwnerStatus === 'pending_owner' ? (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleApproveExtend(r.historyId)}
                          sx={{ fontWeight: 700, borderRadius: 2, px: 2, boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.10)' }}
                        >
                          Xác nhận
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleRejectExtend(r.historyId)}
                          sx={{ fontWeight: 700, borderRadius: 2, px: 2 }}
                        >
                          Từ chối
                        </Button>
                      </Box>
                    ) : (
                      <Chip
                        label={meta.label}
                        color={meta.color}
                        variant={meta.outlined ? 'outlined' : 'filled'}
                        sx={{ fontWeight: 600, fontSize: 14, px: 1.25, py: 0.25, borderRadius: 2 }}
                      />
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
    </div>
  );
};

export default OwnerExtendRequests;

