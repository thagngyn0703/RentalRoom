import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { getAllUsers, banUser, unbanUser } from '../../../services/api/userApi';
import { clearMessage } from '../../../redux/slices/userSlice';
import { useConfirm } from '../../../Components/ConfirmProvider';

const ROLE_FILTER = { all: 'all', user: 'user', admin: 'admin' };

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { confirm } = useConfirm();
  const { allUser, isFetching, error } = useSelector((state) => state?.user?.users || { allUser: null, isFetching: false, error: false });
  const message = useSelector((state) => state?.user?.message || { text: '', type: '' });
  const currentUser = useSelector((state) => state?.auth?.login?.currentUser || null);

  const [roleFilter, setRoleFilter] = useState(ROLE_FILTER.all);
  const [actionLoading, setActionLoading] = useState(null); // id đang xử lý cấm/mở
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    getAllUsers(dispatch).catch((err) => {
      if (err?.message !== 'AUTH_FAILED') console.error('Lỗi tải danh sách tài khoản:', err);
    });
  }, [dispatch]);

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => dispatch(clearMessage()), 4000);
      return () => clearTimeout(t);
    }
  }, [message.text, dispatch]);

  const handleBan = async (user) => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    const ok = await confirm({
      title: 'Xác nhận cấm tài khoản',
      message: 'Bạn có chắc muốn cấm tài khoản này? Người dùng sẽ không thể đăng nhập.',
      confirmText: 'Cấm',
    });
    if (!ok) return;
    setActionLoading(userId);
    try {
      await banUser(String(userId));
      await getAllUsers(dispatch);
      dispatch(clearMessage());
      // Hiển thị thông báo thành công (có thể dùng toast hoặc set message trong slice)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'Không thể cấm tài khoản';
      alert('Lỗi: ' + (typeof msg === 'object' ? JSON.stringify(msg) : msg));
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnban = async (user) => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    const ok = await confirm({
      title: 'Xác nhận mở khóa',
      message: 'Bạn có chắc muốn mở khóa tài khoản này?',
      confirmText: 'Mở khóa',
    });
    if (!ok) return;
    setActionLoading(userId);
    try {
      await unbanUser(String(userId));
      await getAllUsers(dispatch);
      dispatch(clearMessage());
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'Không thể mở khóa';
      alert('Lỗi: ' + (typeof msg === 'object' ? JSON.stringify(msg) : msg));
    } finally {
      setActionLoading(null);
    }
  };

  const list = Array.isArray(allUser) ? allUser : [];
  const filtered =
    roleFilter === ROLE_FILTER.all
      ? list
      : list.filter((u) => (u.role || 'user') === roleFilter);

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / rowsPerPage));

  const currentPage = Math.min(page, totalPages - 1);
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginated = filtered.slice(startIndex, endIndex);

  const handleChangeRoleFilter = (_, value) => {
    setRoleFilter(value);
    setPage(0);
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  if (isFetching && list.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Quản lý tài khoản
      </Typography>

      {message.text && (
        <Alert severity={message.type === 'success' ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => dispatch(clearMessage())}>
          {message.text}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Không thể tải danh sách tài khoản. Vui lòng thử lại.
        </Alert>
      )}

      <Tabs value={roleFilter} onChange={handleChangeRoleFilter} sx={{ mb: 2 }}>
        <Tab label="Tất cả" value={ROLE_FILTER.all} />
        <Tab label="Người dùng" value={ROLE_FILTER.user} />
        <Tab label="Quản trị viên" value={ROLE_FILTER.admin} />
      </Tabs>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Tên đăng nhập</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Vai trò</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  {list.length === 0 ? 'Chưa có tài khoản nào.' : 'Không có tài khoản nào theo bộ lọc.'}
                </TableCell>
              </TableRow>
            )}
            {paginated.map((user) => {
              const isBanned = !!user.isBanned;
              const isSelf = currentUser && String(currentUser._id) === String(user._id);
              const isOnlyAdmin = user.role === 'admin' && list.filter((u) => u.role === 'admin').length <= 1;

              return (
                <TableRow key={user._id} hover sx={{ bgcolor: isBanned ? 'action.hover' : undefined }}>
                  <TableCell>{user.username || '—'}</TableCell>
                  <TableCell>{user.email || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      size="small"
                      color={user.role === 'admin' ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={isBanned ? 'Bị cấm' : 'Hoạt động'}
                      size="small"
                      color={isBanned ? 'error' : 'success'}
                      variant={isBanned ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {isSelf ? (
                      <Typography variant="caption" color="text.secondary">Tài khoản của bạn</Typography>
                    ) : isOnlyAdmin ? (
                      <Typography variant="caption" color="text.secondary">Không thể cấm admin cuối</Typography>
                    ) : isBanned ? (
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        startIcon={<LockOpenIcon />}
                        onClick={() => handleUnban(user)}
                        disabled={actionLoading === (user._id || user.id)}
                      >
                        {actionLoading === (user._id || user.id) ? 'Đang xử lý...' : 'Mở khóa'}
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<BlockIcon />}
                        onClick={() => handleBan(user)}
                        disabled={actionLoading === (user._id || user.id)}
                      >
                        {actionLoading === (user._id || user.id) ? 'Đang xử lý...' : 'Cấm'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {filtered.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Hiển thị {startIndex + 1}–{Math.min(endIndex, totalFiltered)} trong tổng {totalFiltered} tài khoản
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={handlePrevPage}
              disabled={currentPage === 0}
            >
              Trang trước
            </Button>
            <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'center' }}>
              Trang {currentPage + 1}/{totalPages}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
            >
              Trang sau
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AdminUsers;
