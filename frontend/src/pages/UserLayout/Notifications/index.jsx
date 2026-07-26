import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  Button,
  Stack,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../../services/api/notificationApi';

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || window.location.origin;

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState(null);
  const user = useSelector((state) => state.auth?.login?.currentUser);
  const userId = user?.id || user?._id;

  const fetchList = useCallback(async () => {
    try {
      const data = await getNotifications({ limit: 50, unreadOnly: false });
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    if (!userId) return;
    const socket = io(SOCKET_URL, { withCredentials: true, transports: ['websocket', 'polling'] });
    socket.emit('joinUserRoom', userId);
    socket.on('notification', () => {
      fetchList();
    });
    return () => {
      socket.disconnect();
    };
  }, [userId, fetchList]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setItems((prev) =>
        prev.map((n) => (n._id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = items.filter((n) => !n.readAt).length;
  const visibleItems = useMemo(
    () => (tab === 'unread' ? items.filter((n) => !n.readAt) : items),
    [items, tab]
  );
  const now = Date.now();
  const newestItems = visibleItems.filter((n) => now - new Date(n.createdAt).getTime() <= 24 * 60 * 60 * 1000);
  const olderItems = visibleItems.filter((n) => now - new Date(n.createdAt).getTime() > 24 * 60 * 60 * 1000);

  const formatTime = (createdAt) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours} giờ`;
    const days = Math.floor(hours / 24);
    return `${days} ngày`;
  };

  const openNotification = async (n) => {
    setSelected(n);
    if (!n.readAt) await handleMarkRead(n._id);
  };

  const NotificationItem = ({ n }) => (
    <ListItemButton
      onClick={() => openNotification(n)}
      sx={{
        px: 2,
        py: 1.25,
        alignItems: 'flex-start',
        borderRadius: 1.5,
        mb: 0.5,
      }}
    >
      <Avatar sx={{ width: 52, height: 52, mr: 1.5 }}>
        {(n?.title || 'N').charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body1" sx={{ fontWeight: n.readAt ? 500 : 700 }}>
          {n.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {n.body}
        </Typography>
        <Typography variant="body2" color="primary" sx={{ fontWeight: 700, mt: 0.3 }}>
          {formatTime(n.createdAt)}
        </Typography>
      </Box>
      {!n.readAt && (
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            ml: 1,
            mt: 1.5,
            flexShrink: 0,
          }}
        />
      )}
    </ListItemButton>
  );

  return (
    <Box sx={{ width: '100%', bgcolor: '#fff' }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 800 }}>
        Thông báo
      </Typography>

      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant={tab === 'all' ? 'contained' : 'text'}
            onClick={() => setTab('all')}
            sx={{ textTransform: 'none', borderRadius: 999 }}
          >
            Tất cả
          </Button>
          <Button
            size="small"
            variant={tab === 'unread' ? 'contained' : 'text'}
            onClick={() => setTab('unread')}
            sx={{ textTransform: 'none', borderRadius: 999 }}
          >
            Chưa đọc
          </Button>
        </Stack>
        {unreadCount > 0 && (
          <Button size="small" variant="outlined" onClick={handleMarkAllRead} sx={{ textTransform: 'none' }}>
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : visibleItems.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">Chưa có thông báo nào.</Typography>
        </Paper>
      ) : (
        <Paper elevation={1} sx={{ overflow: 'hidden', borderRadius: 3, p: 2 }}>
          {!!newestItems.length && (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Mới</Typography>
              <List disablePadding>
                {newestItems.map((n) => <NotificationItem key={n._id} n={n} />)}
              </List>
            </>
          )}
          {!!olderItems.length && (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, mt: 1 }}>Trước đó</Typography>
              <List disablePadding>
                {olderItems.map((n) => <NotificationItem key={n._id} n={n} />)}
              </List>
            </>
          )}
          <Stack direction="row" justifyContent="center" sx={{ mt: 1 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/user/notifications')}
              sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#d7dbe1', color: '#1a1a1a', boxShadow: 'none' }}
            >
              Xem thông báo trước đó
            </Button>
          </Stack>
        </Paper>
      )}

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>{selected?.title || 'Chi tiết thông báo'}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {selected?.body}
          </Typography>
          {selected?.createdAt && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              {new Date(selected.createdAt).toLocaleString('vi-VN')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          {selected?.type === 'support_reply' && (
            <Button onClick={() => { setSelected(null); navigate('/user/support'); }} variant="outlined">
              Mở hỗ trợ
            </Button>
          )}
          <Button onClick={() => setSelected(null)} variant="contained">Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationsPage;
