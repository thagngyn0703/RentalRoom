import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  Box,
  Typography,
  Button,
  List,
  ListItemButton,
  CircularProgress,
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { getUnreadCount, getNotifications } from '../../services/api/notificationApi';

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || window.location.origin;

const NotificationBellBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('all');
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.login?.currentUser);
  const userId = user?.id || user?._id;
  const open = Boolean(anchorEl);

  const fetchCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, [userId]);

  const fetchPreviewNotifications = useCallback(async () => {
    if (!userId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getNotifications({ limit: 8, unreadOnly: false });
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    if (!userId) return;
    const socket = io(SOCKET_URL, { withCredentials: true, transports: ['websocket', 'polling'] });
    socket.emit('joinUserRoom', userId);
    socket.on('notification', () => {
      fetchCount();
      fetchPreviewNotifications();
    });
    const onUpdated = () => {
      fetchCount();
      fetchPreviewNotifications();
    };
    window.addEventListener('notificationsUpdated', onUpdated);
    return () => {
      socket.disconnect();
      window.removeEventListener('notificationsUpdated', onUpdated);
    };
  }, [userId, fetchCount, fetchPreviewNotifications]);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
    fetchPreviewNotifications();
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleViewAll = () => {
    handleCloseMenu();
    navigate('/user/notifications');
  };

  const filteredItems = useMemo(() => {
    if (tab === 'unread') return items.filter((n) => !n.readAt);
    return items;
  }, [items, tab]);

  if (!user) return null;

  const formatCreatedAt = (createdAt) => {
    if (!createdAt) return '';
    const date = new Date(createdAt);
    const diffMs = Date.now() - date.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours} giờ`;
    const days = Math.floor(hours / 24);
    return `${days} ngày`;
  };

  return (
    <>
      <IconButton
        onClick={handleOpenMenu}
        sx={{
          color: '#667eea',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: 'rgba(102, 126, 234, 0.1)',
            transform: 'scale(1.05)',
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.65rem',
              height: 16,
              minWidth: 16,
              padding: '0 4px',
              fontWeight: 700,
              right: 2,
              top: 2,
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            },
          }}
        >
          <NotificationsNoneIcon sx={{ fontSize: 24 }} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            width: 420,
            maxWidth: 'calc(100vw - 24px)',
            borderRadius: 2,
            mt: 1,
            maxHeight: 640,
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Thông báo</Typography>
            <Button size="small" onClick={handleViewAll} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Xem tất cả
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
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
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <List sx={{ pt: 0, pb: 1 }}>
            {filteredItems.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
                Chưa có thông báo.
              </Typography>
            ) : (
              filteredItems.map((n) => (
                <ListItemButton
                  key={n._id}
                  onClick={handleViewAll}
                  sx={{
                    alignItems: 'flex-start',
                    px: 2,
                    py: 1.25,
                    bgcolor: n.readAt ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: n.readAt ? 600 : 700, mb: 0.3 }}>
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
                    <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                      {formatCreatedAt(n.createdAt)}
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
                        mt: 1.2,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </ListItemButton>
              ))
            )}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationBellBadge;
