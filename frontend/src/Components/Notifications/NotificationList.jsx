import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, List, ListItem, ListItemText, CircularProgress, Divider, Badge } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import axiosJWT from '../../config/axiosJWT';

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || window.location.origin;

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = useSelector((state) => state.auth?.login?.currentUser);
  const userId = user?.id || user?._id;

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axiosJWT.get('/api/notifications');
      setNotifications(res.data?.items || []);
      setUnreadCount(res.data?.items?.filter(n => !n.readAt).length || 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!userId) return;
    const socket = io(SOCKET_URL, { withCredentials: true, transports: ['websocket', 'polling'] });
    socket.emit('joinUserRoom', userId);
    socket.on('notification', fetchNotifications);
    return () => socket.disconnect();
  }, [userId, fetchNotifications]);

  if (!user) return (
    <Box p={3}><Typography>Bạn cần đăng nhập để xem thông báo.</Typography></Box>
  );

  if (loading) return (
    <Box p={3} display="flex" justifyContent="center"><CircularProgress /></Box>
  );

  return (
    <Box p={3} maxWidth={600} mx="auto">
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h5" flex={1}>Thông báo</Typography>
        <Badge badgeContent={unreadCount} color="error" max={99} sx={{ mr: 2 }}>
          <NotificationsNoneIcon color="action" />
        </Badge>
      </Box>
      <List>
        {notifications.length === 0 && <ListItem><ListItemText primary="Không có thông báo nào." /></ListItem>}
        {notifications.map((notif) => (
          <React.Fragment key={notif._id}>
            <ListItem alignItems="flex-start" sx={{ bgcolor: !notif.readAt ? '#e3f2fd' : undefined }}>
              <ListItemText
                primary={<b>{notif.title}</b>}
                secondary={<>
                  <span>{notif.body}</span><br />
                  <span style={{ fontSize: 12, color: '#888' }}>{new Date(notif.createdAt).toLocaleString()}</span>
                </>}
              />
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default NotificationList;
