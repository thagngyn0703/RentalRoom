import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Badge, IconButton } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import chatApi from '../../services/api/chatApi';

const SOCKET_URL =
    process.env.REACT_APP_SOCKET_URL || window.location.origin;

const POLLING_INTERVAL = 5000; // 5 seconds
const DEMO_DATA_ENABLED = true; // Enable fallback to demo data

const NotificationBadge = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [usePolling, setUsePolling] = useState(false);
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.login.currentUser);
    const socketRef = useRef(null);
    const pollingIntervalRef = useRef(null);

    // Fetch unread count with fallback
    const fetchUnreadCount = useCallback(async () => {
        try {
            const count = await chatApi.getUnreadCount();
            console.log('📊 Fetched unread count from API:', count);
            setUnreadCount(count);
            // Sync to localStorage
            localStorage.setItem('chatBadgeCount', count.toString());
            return count;
        } catch (err) {
            console.error('Error fetching unread count:', err);
            // Fallback: Try localStorage first
            try {
                const cached = parseInt(localStorage.getItem('chatBadgeCount') || '0');
                if (cached >= 0) {
                    console.log('Using cached count from localStorage:', cached);
                    setUnreadCount(cached);
                    return cached;
                }
            } catch (e) {
                console.error('LocalStorage error:', e);
            }
            return 0;
        }
    }, []);

    // Setup polling as fallback
    useEffect(() => {
        if (!user || !usePolling) return;

        console.log('📊 Starting polling for unread count (fallback mode)');

        // Initial fetch
        fetchUnreadCount();

        // Setup polling interval
        pollingIntervalRef.current = setInterval(() => {
            fetchUnreadCount();
        }, POLLING_INTERVAL);

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [user, usePolling, fetchUnreadCount]);

    // Setup WebSocket connection
    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }

        // Initial fetch
        fetchUnreadCount();

        // Try WebSocket first
        const socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('🟢 NotificationBadge: Socket connected');
            setUsePolling(false); // Disable polling when socket connects
            socket.emit('joinUserRoom', user._id || user.id);
        });

        socket.on('connect_error', (err) => {
            console.error('❌ Socket connection error:', err.message);
            console.log('🔄 Falling back to polling mode');
            setUsePolling(true); // Enable polling on socket error
        });

        socket.on('disconnect', (reason) => {
            console.log('🔴 Socket disconnected:', reason);
            if (reason === 'io server disconnect' || reason === 'transport close') {
                setUsePolling(true); // Enable polling on disconnect
            }
        });

        // Listen for new message notifications
        socket.on('newMessageNotification', ({ conversationId, senderId }) => {
            const myId = user._id || user.id;
            if (String(senderId) !== String(myId)) {
                console.log('📬 New message notification received');
                // Optimistic update
                setUnreadCount((prev) => prev + 1);
            }
        });

        // Listen for read notifications
        socket.on('messagesRead', () => {
            console.log('✅ Messages marked as read');
            fetchUnreadCount();
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [user, fetchUnreadCount]);

    // Listen for custom events to refresh count
    useEffect(() => {
        const handleRefresh = () => {
            console.log('🔄 chatUnreadUpdated event received - fetching fresh count');
            if (user) {
                fetchUnreadCount();
            }
        };

        const handleDecrement = (event) => {
            // Optimistic update when conversation is opened
            console.log('👁️ chatConversationOpened event received', event.detail);
            const { count } = event.detail || {};
            if (typeof count === 'number' && count > 0) {
                console.log(`📉 Decreasing badge count by ${count}`);
                setUnreadCount((prev) => {
                    const newCount = Math.max(0, prev - count);
                    console.log(`Badge count: ${prev} → ${newCount}`);
                    // Sync to localStorage
                    localStorage.setItem('chatBadgeCount', newCount.toString());
                    return newCount;
                });
            } else {
                console.log('⚠️ Invalid count in event:', count);
            }
        };

        const handleStorage = (e) => {
            // Listen for localStorage changes (from other tabs or components)
            if (e.key === 'chatBadgeCount' || !e.key) {
                try {
                    const cached = parseInt(localStorage.getItem('chatBadgeCount') || '0');
                    console.log('📦 Storage event: updating badge to', cached);
                    setUnreadCount(cached);
                } catch (e) {
                    console.error('LocalStorage error:', e);
                }
            }
        };

        window.addEventListener('chatUnreadUpdated', handleRefresh);
        window.addEventListener('chatConversationOpened', handleDecrement);
        window.addEventListener('storage', handleStorage);

        console.log('✅ NotificationBadge: Event listeners registered');

        return () => {
            window.removeEventListener('chatUnreadUpdated', handleRefresh);
            window.removeEventListener('chatConversationOpened', handleDecrement);
            window.removeEventListener('storage', handleStorage);
            console.log('🗑️ NotificationBadge: Event listeners removed');
        };
    }, [user, fetchUnreadCount]);

    const handleClick = () => {
        navigate('/user/chat');
    };

    if (!user) return null;

    return (
        <IconButton
            onClick={handleClick}
            sx={{
                color: '#087f72',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                    bgcolor: 'rgba(8, 127, 114, 0.1)',
                    transform: 'scale(1.05)',
                }
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
                        animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                    }
                }}
            >
                <ChatBubbleOutlineIcon sx={{ fontSize: 22 }} />
            </Badge>
            {usePolling && (
                <span style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    backgroundColor: '#ff9800',
                    animation: 'blink 1.5s infinite',
                    boxShadow: '0 0 4px rgba(255, 152, 0, 0.6)'
                }} title="Polling mode (WebSocket unavailable)" />
            )}
        </IconButton>
    );
};

export default NotificationBadge;

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.15);
      opacity: 0.9;
    }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;
if (!document.querySelector('style[data-notification-badge]')) {
  style.setAttribute('data-notification-badge', 'true');
  document.head.appendChild(style);
}
