import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Typography, List, ListItemButton, ListItemText, ListItemAvatar,
    Avatar, Divider, TextField, Button, CircularProgress, Paper, Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { io } from 'socket.io-client';
import chatApi from '../../services/api/chatApi';
import { useSelector } from 'react-redux';
import UnreadBadge from '../../Components/Chat/UnreadBadge';
import { useLocation } from 'react-router-dom';

const SOCKET_URL =
    process.env.REACT_APP_SOCKET_URL || window.location.origin;

const ChatInboxPage = () => {
    const currentUser = useSelector((s) => s?.auth?.login?.currentUser);
    const myId = currentUser?._id || currentUser?.id;
    const location = useLocation();

    const [conversations, setConversations] = useState([]);
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [inputText, setInputText] = useState('');
    const [sendCount, setSendCount] = useState(0);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const sendingRef = useRef(false);
    const pendingAutoSelectRef = useRef(null);

    // Add CSS animations
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.1);
                    opacity: 0.9;
                }
            }
        `;
        if (!document.querySelector('style[data-chat-inbox-animations]')) {
            style.setAttribute('data-chat-inbox-animations', 'true');
            document.head.appendChild(style);
        }
        return () => {
            const existingStyle = document.querySelector('style[data-chat-inbox-animations]');
            if (existingStyle) {
                existingStyle.remove();
            }
        };
    }, []);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    // Parse query params used when navigating from "contact owner" buttons
    useEffect(() => {
        const params = new URLSearchParams(location.search || '');
        const roomId = params.get('roomId');
        const ownerId = params.get('ownerId');
        pendingAutoSelectRef.current = roomId ? { roomId, ownerId } : null;
    }, [location.search]);

    // Load conversation list
    useEffect(() => {
        const load = async () => {
            setLoadingConvs(true);
            try {
                const res = await chatApi.getMyConversations();
                const convs = res.data || [];
                setConversations(convs);

                const pending = pendingAutoSelectRef.current;
                if (pending?.roomId) {
                    const byRoom = convs.find((c) => String(c.roomId) === String(pending.roomId));
                    if (byRoom) {
                        setSelectedConv(byRoom);
                        pendingAutoSelectRef.current = null;
                    } else if (pending.ownerId && String(pending.ownerId) !== String(myId)) {
                        try {
                            const created = await chatApi.getOrCreateConversation({
                                ownerId: pending.ownerId,
                                roomId: pending.roomId,
                            });
                            const createdId = created?.data?._id;
                            if (createdId) {
                                const reloadRes = await chatApi.getMyConversations();
                                const reloadedConvs = reloadRes.data || [];
                                setConversations(reloadedConvs);
                                const target = reloadedConvs.find((c) => String(c._id) === String(createdId))
                                    || reloadedConvs.find((c) => String(c.roomId) === String(pending.roomId));
                                if (target) setSelectedConv(target);
                            }
                            pendingAutoSelectRef.current = null;
                        } catch (e) {
                            console.error('Auto-open conversation failed:', e);
                        }
                    }
                }
            } catch (err) {
                console.error('Load conversations error:', err);
                // Fallback to demo data if API fails
                if (conversations.length === 0) {
                    console.log('Using demo conversation data');
                    setConversations([
                        {
                            _id: 'demo-1',
                            otherUser: { username: 'Demo User', email: 'demo@example.com' },
                            latestMessage: { text: 'Xin chào! Đây là tin nhắn demo.', createdAt: new Date() },
                            unreadCount: 0,
                            roomId: 'demo-room-1'
                        }
                    ]);
                }
            } finally {
                setLoadingConvs(false);
            }
        };
        load();

        // Setup global socket for notifications
        const globalSocket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        globalSocket.on('connect', () => {
            console.log('🟢 ChatInbox: Global socket connected');
            globalSocket.emit('joinUserRoom', myId);
        });

        globalSocket.on('connect_error', (err) => {
            console.error('❌ Global socket error:', err.message);
        });

        globalSocket.on('newMessageNotification', ({ conversationId, senderId }) => {
            console.log('📬 New message notification in inbox');
            // Optimistic update: increment unread count
            setConversations((prev) =>
                prev.map((c) => {
                    if (String(c._id) === String(conversationId)) {
                        const isCurrentlyViewing = selectedConv?._id === conversationId;
                        return {
                            ...c,
                            unreadCount: isCurrentlyViewing ? 0 : (c.unreadCount || 0) + 1,
                        };
                    }
                    return c;
                })
            );
            // Trigger global notification badge update
            window.dispatchEvent(new Event('chatUnreadUpdated'));
        });

        // Listen for custom events to refresh list
        const handleChatUpdate = () => {
            load();
        };
        window.addEventListener('chatUnreadUpdated', handleChatUpdate);

        return () => {
            globalSocket.disconnect();
            window.removeEventListener('chatUnreadUpdated', handleChatUpdate);
        };
    }, [myId, selectedConv?._id, location.search]);

    // When a conversation is selected, load messages + connect socket
    useEffect(() => {
        if (!selectedConv) return;

        setLoadingMsgs(true);
        setMessages([]);

        let socket;
        let cancelled = false;

        const init = async () => {
            try {
                // Optimistic update: immediately clear unread count
                const previousUnreadCount = selectedConv.unreadCount || 0;
                console.log(`📂 Opening conversation ${selectedConv._id}, unread count: ${previousUnreadCount}`);

                setConversations((prev) =>
                    prev.map((c) => String(c._id) === String(selectedConv._id) ? { ...c, unreadCount: 0 } : c)
                );

                // Trigger optimistic badge update
                if (previousUnreadCount > 0) {
                    console.log(`🔔 Dispatching chatConversationOpened event with count: ${previousUnreadCount}`);
                    const event = new CustomEvent('chatConversationOpened', {
                        detail: { count: previousUnreadCount }
                    });
                    window.dispatchEvent(event);
                    console.log('✅ Event dispatched successfully');

                    // Also trigger immediate refresh as backup
                    setTimeout(() => {
                        window.dispatchEvent(new Event('chatUnreadUpdated'));
                    }, 100);
                } else {
                    console.log('ℹ️ No unread messages, skipping event dispatch');
                }

                // Mark conversation as read (API call)
                try {
                    await chatApi.markAsRead(selectedConv._id);
                    console.log('✅ Conversation marked as read via API');
                    // Trigger event to update notification badge
                    window.dispatchEvent(new Event('chatUnreadUpdated'));
                } catch (err) {
                    console.error('❌ Error marking as read:', err);
                    // Keep optimistic update even if API fails
                }

                const res = await chatApi.getMessages(selectedConv._id);
                if (cancelled) return;
                setMessages(res.data || []);

                socket = io(SOCKET_URL, {
                    withCredentials: true,
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionDelay: 1000
                });
                socketRef.current = socket;

                socket.on('connect', () => {
                    console.log('🟢 ChatInbox: Conversation socket connected');
                    socket.emit('joinConversation', selectedConv._id);
                    socket.emit('joinUserRoom', myId);
                });

                socket.on('connect_error', (err) => {
                    console.error('❌ Conversation socket error:', err.message);
                });

                socket.on('receiveMessage', (msg) => {
                    console.log('📨 Message received via socket');
                    setMessages((prev) => {
                        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
                        return [...prev, msg];
                    });
                    // Update latest message preview in sidebar list
                    setConversations((prev) =>
                        prev.map((c) => String(c._id) === String(msg.conversationId) ? { ...c, latestMessage: msg } : c)
                    );
                    // Mark as read immediately when receiving message in open chat
                    chatApi.markAsRead(selectedConv._id).catch(console.error);
                    window.dispatchEvent(new Event('chatUnreadUpdated'));
                });
            } catch (err) {
                if (!cancelled) {
                    console.error('❌ Load messages error:', err);
                    // Fallback: show demo message if API fails
                    if (messages.length === 0) {
                        console.log('Using demo message data');
                        setMessages([
                            {
                                _id: 'demo-msg-1',
                                conversationId: selectedConv._id,
                                senderId: 'demo-sender',
                                text: 'Đây là tin nhắn demo. API hiện không khả dụng.',
                                createdAt: new Date().toISOString()
                            }
                        ]);
                    }
                }
            } finally {
                if (!cancelled) setLoadingMsgs(false);
            }
        };

        init();

        return () => {
            cancelled = true;
            if (socket) {
                socket.disconnect();
                socketRef.current = null;
            }
        };
    }, [selectedConv?._id, myId]);

    const handleSend = () => {
        if (sendingRef.current) return;
        const text = inputText.trim();
        if (!text || !selectedConv || !socketRef.current) return;

        sendingRef.current = true;
        const tempId = `temp_${Date.now()}`;
        setInputText('');
        setSendCount((c) => c + 1);

        // Optimistic update: add message immediately
        const optimisticMsg = {
            _id: tempId,
            conversationId: selectedConv._id,
            senderId: myId,
            text,
            createdAt: new Date().toISOString(),
            isPending: true, // Mark as pending
        };
        setMessages((prev) => [...prev, optimisticMsg]);

        // Update latest message in sidebar optimistically
        setConversations((prev) =>
            prev.map((c) => String(c._id) === String(selectedConv._id)
                ? { ...c, latestMessage: { text, senderId: myId, createdAt: new Date().toISOString() } }
                : c
            )
        );

        // Send via socket
        socketRef.current.emit('sendMessage', {
            conversationId: selectedConv._id,
            senderId: myId,
            text,
        }, (response) => {
            // Callback when server confirms
            if (response?.success) {
                console.log('✅ Message sent successfully');
                // Replace temp message with real one
                setMessages((prev) =>
                    prev.map((m) => m._id === tempId ? { ...response.message, isPending: false } : m)
                );
            } else {
                console.error('❌ Failed to send message');
                // Mark message as failed
                setMessages((prev) =>
                    prev.map((m) => m._id === tempId ? { ...m, isFailed: true, isPending: false } : m)
                );
            }
        });

        setTimeout(() => { sendingRef.current = false; }, 300);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', gap: 2 }}>

            {/* LEFT — Conversation list */}
            <Paper sx={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 3 }} elevation={2}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ChatBubbleOutlineIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>Hộp thư chat</Typography>
                </Box>

                {loadingConvs ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                        <CircularProgress size={28} />
                    </Box>
                ) : conversations.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary" variant="body2">Chưa có cuộc trò chuyện nào.</Typography>
                    </Box>
                ) : (
                    <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
                        {conversations.map((conv, idx) => {
                            const other = conv.otherUser;
                            const latest = conv.latestMessage;
                            const isSelected = selectedConv?._id === conv._id;

                            return (
                                <React.Fragment key={conv._id}>
                                    <ListItemButton
                                        selected={isSelected}
                                        onClick={() => {
                                            console.log(`🖱️ Clicked on conversation ${conv._id}, unread: ${conv.unreadCount}`);

                                            // Trigger event IMMEDIATELY before state update
                                            if (conv.unreadCount > 0) {
                                                console.log(`🔔 Triggering chatConversationOpened with count: ${conv.unreadCount}`);

                                                // Method 1: Custom Event
                                                window.dispatchEvent(new CustomEvent('chatConversationOpened', {
                                                    detail: { count: conv.unreadCount }
                                                }));

                                                // Method 2: LocalStorage (backup)
                                                try {
                                                    const currentBadge = parseInt(localStorage.getItem('chatBadgeCount') || '0');
                                                    const newBadge = Math.max(0, currentBadge - conv.unreadCount);
                                                    localStorage.setItem('chatBadgeCount', newBadge.toString());
                                                    console.log(`💾 LocalStorage: ${currentBadge} → ${newBadge}`);

                                                    // Trigger storage event
                                                    window.dispatchEvent(new Event('storage'));
                                                } catch (e) {
                                                    console.error('LocalStorage error:', e);
                                                }
                                            }

                                            // Then update selected conversation
                                            setSelectedConv(conv);
                                        }}
                                        sx={{
                                            px: 2,
                                            py: 1.5,
                                            bgcolor: conv.unreadCount > 0 ? 'rgba(8, 127, 114, 0.05)' : 'transparent',
                                            borderLeft: conv.unreadCount > 0 ? '3px solid #087f72' : '3px solid transparent',
                                            transition: 'all 0.2s ease',
                                            '&.Mui-selected': {
                                                bgcolor: 'rgba(8, 127, 114, 0.15)',
                                                borderLeft: '3px solid #087f72'
                                            },
                                            '&:hover': {
                                                bgcolor: 'rgba(8, 127, 114, 0.1)',
                                            }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, fontSize: 16 }}>
                                                {other?.username?.[0]?.toUpperCase() || 'U'}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={conv.unreadCount > 0 ? 700 : 600}
                                                        noWrap
                                                        sx={{
                                                            flex: 1,
                                                            color: conv.unreadCount > 0 ? 'text.primary' : 'text.secondary'
                                                        }}
                                                    >
                                                        {other?.username || 'Người dùng'}
                                                    </Typography>
                                                    <UnreadBadge count={conv.unreadCount} size="small" />
                                                </Box>
                                            }
                                            secondary={
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    noWrap
                                                    sx={{
                                                        fontWeight: conv.unreadCount > 0 ? 600 : 400,
                                                        color: conv.unreadCount > 0 ? 'text.primary' : 'text.secondary'
                                                    }}
                                                >
                                                    {latest ? `${String(latest.senderId) === String(myId) ? 'Bạn: ' : ''}${latest.text}` : 'Chưa có tin nhắn'}
                                                </Typography>
                                            }
                                        />
                                    </ListItemButton>
                                    {idx < conversations.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            );
                        })}
                    </List>
                )}
            </Paper>

            {/* RIGHT — Message panel */}
            <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 3 }} elevation={2}>
                {!selectedConv ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
                        <ChatBubbleOutlineIcon sx={{ fontSize: 64, color: 'grey.300' }} />
                        <Typography color="text.secondary">Chọn một cuộc trò chuyện để xem tin nhắn</Typography>
                    </Box>
                ) : (
                    <>
                        {/* Chat header */}
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5, background: 'linear-gradient(135deg, #087f72 0%, #37a795 100%)' }}>
                            <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 36, height: 36, fontWeight: 700 }}>
                                {selectedConv.otherUser?.username?.[0]?.toUpperCase() || 'U'}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white' }}>
                                    {selectedConv.otherUser?.username || 'Người dùng'}
                                </Typography>
                                <Chip
                                    label={`Phòng #${String(selectedConv.roomId).slice(-6)}`}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 11, height: 20 }}
                                />
                            </Box>
                        </Box>

                        {/* Messages */}
                        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1, bgcolor: '#f6f8f5' }}>
                            {loadingMsgs ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                                    <CircularProgress size={28} />
                                </Box>
                            ) : messages.length === 0 ? (
                                <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center', mt: 4 }}>
                                    Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
                                </Typography>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = String(msg.senderId) === String(myId);
                                    return (
                                        <Box key={msg._id || idx} sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 1, alignItems: 'flex-end' }}>
                                            {!isMe && (
                                                <Avatar sx={{ width: 28, height: 28, bgcolor: '#087f72', fontSize: 13 }}>
                                                    {selectedConv.otherUser?.username?.[0]?.toUpperCase() || 'U'}
                                                </Avatar>
                                            )}
                                            <Box sx={{
                                                maxWidth: '65%',
                                                px: 1.5, py: 1,
                                                borderRadius: 3,
                                                bgcolor: isMe ? '#087f72' : '#fff',
                                                color: isMe ? 'white' : '#212121',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                borderBottomRightRadius: isMe ? 4 : 16,
                                                borderBottomLeftRadius: isMe ? 16 : 4,
                                                opacity: msg.isPending ? 0.6 : 1,
                                                border: msg.isFailed ? '1px solid #f44336' : 'none',
                                            }}>
                                                <Typography variant="body2">{msg.text}</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', mt: 0.3 }}>
                                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                    {msg.isPending && (
                                                        <CircularProgress size={10} sx={{ color: isMe ? 'white' : 'primary.main' }} />
                                                    )}
                                                    {msg.isFailed && (
                                                        <Typography variant="caption" sx={{ color: '#f44336', fontSize: 9 }}>
                                                            ✗ Lỗi
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </Box>

                        {/* Input bar */}
                        <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, bgcolor: 'white' }}>
                            <TextField
                                key={sendCount}
                                autoFocus
                                fullWidth
                                size="small"
                                variant="outlined"
                                placeholder="Nhập tin nhắn..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                multiline
                                maxRows={3}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px', fontSize: 14 } }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleSend}
                                disabled={!inputText.trim()}
                                sx={{ minWidth: 44, borderRadius: '50%', p: '8px' }}
                            >
                                <SendIcon fontSize="small" />
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default ChatInboxPage;
