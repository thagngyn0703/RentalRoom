import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    TextField,
    Button,
    Avatar,
    CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { io } from 'socket.io-client';
import chatApi from '../../services/api/chatApi';
import './ChatModal.css';

// Determine the socket server URL in dev vs production
const SOCKET_URL =
    process.env.REACT_APP_SOCKET_URL || window.location.origin;

const ChatModal = ({ open, onClose, ownerId, roomId, currentUser, showToast }) => {
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [sendCount, setSendCount] = useState(0);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const sendingRef = useRef(false);

    // Scroll to the latest message
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Initialize conversation and socket when the modal opens
    useEffect(() => {
        if (!open || !ownerId || !roomId || !currentUser) return;

        let socket;
        let cancelled = false;

        const init = async () => {
            setLoading(true);
            try {
                if (!ownerId) {
                    showToast?.('Không thể xác định chủ phòng. Vui lòng thử lại sau.', 'error');
                    onClose();
                    return;
                }

                const myId = currentUser?._id || currentUser?.id;
                if (myId && String(myId) === String(ownerId)) {
                    showToast?.('Đây là phòng của bạn.', 'info');
                    onClose();
                    return;
                }

                // 1. Get or create conversation
                const convRes = await chatApi.getOrCreateConversation({ ownerId, roomId });
                if (cancelled) return;
                const conv = convRes.data;
                setConversation(conv);

                // 2. Mark conversation as read
                try {
                    await chatApi.markAsRead(conv._id);
                    // Trigger event to update notification badge
                    window.dispatchEvent(new Event('chatUnreadUpdated'));
                } catch (err) {
                    console.error('Error marking as read:', err);
                }

                // 3. Fetch history
                const msgRes = await chatApi.getMessages(conv._id);
                if (cancelled) return;
                setMessages(msgRes.data || []);

                // 4. Connect socket
                socket = io(SOCKET_URL, { withCredentials: true, transports: ['websocket', 'polling'] });
                socketRef.current = socket;

                socket.on('connect', () => {
                    socket.emit('joinConversation', conv._id);
                    socket.emit('joinUserRoom', myId);
                });

                socket.on('receiveMessage', (msg) => {
                    setMessages((prev) => {
                        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
                        return [...prev, msg];
                    });
                    // Mark as read immediately when receiving message in open chat
                    chatApi.markAsRead(conv._id).catch(console.error);
                    window.dispatchEvent(new Event('chatUnreadUpdated'));
                });

                socket.on('connect_error', (err) => {
                    console.error('Socket error:', err.message);
                });
            } catch (err) {
                if (!cancelled) {
                    console.error('Chat init error:', err);
                    showToast?.('Không thể kết nối chat. Vui lòng thử lại.', 'error');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        init();

        // Cleanup on close
        return () => {
            cancelled = true;
            if (socket) {
                socket.disconnect();
                socketRef.current = null;
            }
            setConversation(null);
            setMessages([]);
        };
    }, [open, ownerId, roomId, currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSend = () => {
        if (sendingRef.current) return;
        const text = inputText.trim();
        if (!text || !conversation || !socketRef.current) return;

        sendingRef.current = true;
        const tempId = `temp_${Date.now()}`;
        setInputText('');
        setSendCount((c) => c + 1);
        const senderId = currentUser._id || currentUser.id;

        // Optimistic update: add message immediately
        const optimisticMsg = {
            _id: tempId,
            conversationId: conversation._id,
            senderId,
            text,
            createdAt: new Date().toISOString(),
            isPending: true,
        };
        setMessages((prev) => [...prev, optimisticMsg]);

        // Send via socket with callback
        socketRef.current.emit('sendMessage', {
            conversationId: conversation._id,
            senderId,
            text,
        }, (response) => {
            if (response?.success) {
                console.log('✅ Message sent successfully');
                // Replace temp message with real one
                setMessages((prev) =>
                    prev.map((m) => m._id === tempId ? { ...response.message, isPending: false } : m)
                );
            } else {
                console.error('❌ Failed to send message');
                // Mark as failed
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

    if (!open) return null;

    const myId = currentUser?._id || currentUser?.id;

    return (
        <Paper className="chat-modal" elevation={6}>
            {/* Header */}
            <Box className="chat-header">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ChatBubbleOutlineIcon sx={{ color: '#fff', fontSize: 20 }} />
                    <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
                        Chat với chủ phòng
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: '#fff' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Messages area */}
            <Box className="chat-messages">
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                        <CircularProgress size={28} />
                    </Box>
                ) : messages.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                        Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
                    </Typography>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = String(msg.senderId) === String(myId);
                        return (
                            <Box key={msg._id || idx} className={`chat-bubble-row ${isMe ? 'me' : 'other'}`}>
                                {!isMe && (
                                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#087f72', fontSize: 13 }}>C</Avatar>
                                )}
                                <Box
                                    className={`chat-bubble ${isMe ? 'bubble-me' : 'bubble-other'}`}
                                    sx={{ opacity: msg.isPending ? 0.6 : 1 }}
                                >
                                    <Typography variant="body2">{msg.text}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                                        <Typography className="chat-time">
                                            {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </Typography>
                                        {msg.isPending && (
                                            <CircularProgress size={8} sx={{ color: isMe ? 'white' : 'primary.main' }} />
                                        )}
                                        {msg.isFailed && (
                                            <Typography variant="caption" sx={{ color: '#f44336', fontSize: 9 }}>
                                                ✗
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

            {/* Input area */}
            <Box className="chat-input-area">
                <TextField
                    key={sendCount}
                    autoFocus
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Nhập tin nhắn..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    multiline
                    maxRows={3}
                    disabled={loading || !conversation}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px', fontSize: 14 } }}
                />
                <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={!inputText.trim() || loading || !conversation}
                    sx={{ minWidth: 44, borderRadius: '50%', p: '8px', ml: 1 }}
                >
                    <SendIcon fontSize="small" />
                </Button>
            </Box>
        </Paper>
    );
};

export default ChatModal;
