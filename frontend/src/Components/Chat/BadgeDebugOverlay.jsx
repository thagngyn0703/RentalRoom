import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';

/**
 * Debug overlay để xem real-time badge state
 * Chỉ hiển thị trong development mode
 * 
 * Cách sử dụng:
 * 1. Import vào App.js
 * 2. Thêm <BadgeDebugOverlay /> vào cuối component
 * 3. Xem state real-time ở góc dưới phải màn hình
 */
const BadgeDebugOverlay = () => {
    const [badgeCount, setBadgeCount] = useState(0);
    const [storageCount, setStorageCount] = useState(0);
    const [events, setEvents] = useState([]);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Update badge count from DOM
        const updateBadgeCount = () => {
            const badges = document.querySelectorAll('[class*="MuiBadge-badge"]');
            if (badges.length > 0) {
                const text = badges[0].textContent;
                setBadgeCount(parseInt(text) || 0);
            }
        };

        // Update storage count
        const updateStorageCount = () => {
            const stored = localStorage.getItem('chatBadgeCount');
            setStorageCount(parseInt(stored) || 0);
        };

        // Listen for events
        const handleConversationOpened = (e) => {
            const timestamp = new Date().toLocaleTimeString();
            setEvents(prev => [
                { time: timestamp, event: 'conversationOpened', data: e.detail },
                ...prev.slice(0, 4)
            ]);
            updateBadgeCount();
            updateStorageCount();
        };

        const handleUnreadUpdated = () => {
            const timestamp = new Date().toLocaleTimeString();
            setEvents(prev => [
                { time: timestamp, event: 'unreadUpdated', data: {} },
                ...prev.slice(0, 4)
            ]);
            updateBadgeCount();
            updateStorageCount();
        };

        const handleStorage = () => {
            updateStorageCount();
        };

        // Initial update
        updateBadgeCount();
        updateStorageCount();

        // Poll for badge changes
        const interval = setInterval(() => {
            updateBadgeCount();
            updateStorageCount();
        }, 1000);

        // Event listeners
        window.addEventListener('chatConversationOpened', handleConversationOpened);
        window.addEventListener('chatUnreadUpdated', handleUnreadUpdated);
        window.addEventListener('storage', handleStorage);

        return () => {
            clearInterval(interval);
            window.removeEventListener('chatConversationOpened', handleConversationOpened);
            window.removeEventListener('chatUnreadUpdated', handleUnreadUpdated);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    if (!visible) {
        return (
            <Button
                onClick={() => setVisible(true)}
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    zIndex: 9999,
                    minWidth: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: '#1976d2',
                    color: 'white',
                    '&:hover': { bgcolor: '#1565c0' }
                }}
            >
                🐛
            </Button>
        );
    }

    return (
        <Paper
            elevation={8}
            sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                width: 320,
                maxHeight: 400,
                zIndex: 9999,
                p: 2,
                bgcolor: 'rgba(0, 0, 0, 0.9)',
                color: 'white',
                fontFamily: 'monospace',
                fontSize: 12,
                overflow: 'auto'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#4fc3f7' }}>
                    🐛 Badge Debug
                </Typography>
                <Button
                    size="small"
                    onClick={() => setVisible(false)}
                    sx={{ minWidth: 30, color: 'white' }}
                >
                    ✕
                </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#81c784' }}>State:</Typography>
                <Box sx={{ pl: 1, mt: 0.5 }}>
                    <Typography variant="caption">
                        Badge Count: <strong style={{ color: '#ffeb3b' }}>{badgeCount}</strong>
                    </Typography>
                    <br />
                    <Typography variant="caption">
                        Storage Count: <strong style={{ color: '#ffeb3b' }}>{storageCount}</strong>
                    </Typography>
                    <br />
                    <Typography variant="caption" sx={{ 
                        color: badgeCount === storageCount ? '#81c784' : '#f44336' 
                    }}>
                        {badgeCount === storageCount ? '✓ Synced' : '✗ Out of sync'}
                    </Typography>
                </Box>
            </Box>

            <Box>
                <Typography variant="caption" sx={{ color: '#81c784' }}>Recent Events:</Typography>
                <Box sx={{ pl: 1, mt: 0.5 }}>
                    {events.length === 0 ? (
                        <Typography variant="caption" sx={{ color: '#999' }}>
                            No events yet
                        </Typography>
                    ) : (
                        events.map((evt, idx) => (
                            <Box key={idx} sx={{ mb: 0.5, pb: 0.5, borderBottom: '1px solid #333' }}>
                                <Typography variant="caption" sx={{ color: '#90caf9' }}>
                                    {evt.time}
                                </Typography>
                                <br />
                                <Typography variant="caption">
                                    {evt.event === 'conversationOpened' ? '👁️' : '🔄'} {evt.event}
                                </Typography>
                                {evt.data?.count && (
                                    <>
                                        <br />
                                        <Typography variant="caption" sx={{ color: '#ffeb3b' }}>
                                            count: {evt.data.count}
                                        </Typography>
                                    </>
                                )}
                            </Box>
                        ))
                    )}
                </Box>
            </Box>

            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #333' }}>
                <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    onClick={() => {
                        window.dispatchEvent(new CustomEvent('chatConversationOpened', { 
                            detail: { count: 1 } 
                        }));
                    }}
                    sx={{ color: 'white', borderColor: 'white', fontSize: 10 }}
                >
                    Test: Decrease by 1
                </Button>
            </Box>
        </Paper>
    );
};

export default BadgeDebugOverlay;
