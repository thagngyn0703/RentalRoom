import React from 'react';
import { Box } from '@mui/material';

/**
 * Unread Badge Component
 * Hiển thị số tin nhắn chưa đọc với animation đẹp
 */
const UnreadBadge = ({ count, size = 'medium', variant = 'default' }) => {
    if (!count || count <= 0) return null;

    const sizes = {
        small: {
            fontSize: '0.6rem',
            height: 16,
            minWidth: 16,
            px: 0.5,
        },
        medium: {
            fontSize: '0.65rem',
            height: 18,
            minWidth: 18,
            px: 0.75,
        },
        large: {
            fontSize: '0.7rem',
            height: 20,
            minWidth: 20,
            px: 1,
        }
    };

    const variants = {
        default: {
            bgcolor: '#f44336',
            color: 'white',
            boxShadow: '0 2px 4px rgba(244, 67, 54, 0.3)',
        },
        primary: {
            bgcolor: '#667eea',
            color: 'white',
            boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)',
        },
        success: {
            bgcolor: '#4caf50',
            color: 'white',
            boxShadow: '0 2px 4px rgba(76, 175, 80, 0.3)',
        },
        warning: {
            bgcolor: '#ff9800',
            color: 'white',
            boxShadow: '0 2px 4px rgba(255, 152, 0, 0.3)',
        }
    };

    const sizeStyle = sizes[size] || sizes.medium;
    const variantStyle = variants[variant] || variants.default;

    return (
        <Box
            sx={{
                ...sizeStyle,
                ...variantStyle,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                animation: 'unreadPulse 2s infinite',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'scale(1.1)',
                }
            }}
        >
            {count > 99 ? '99+' : count}
        </Box>
    );
};

export default UnreadBadge;

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes unreadPulse {
        0%, 100% { 
            transform: scale(1); 
            opacity: 1;
        }
        50% { 
            transform: scale(1.08); 
            opacity: 0.95;
        }
    }
`;
if (!document.querySelector('style[data-unread-badge]')) {
    style.setAttribute('data-unread-badge', 'true');
    document.head.appendChild(style);
}
