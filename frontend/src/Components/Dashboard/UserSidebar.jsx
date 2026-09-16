import {
    Box,
    Typography,
    Button,
    Divider,
    List,
    ListItemButton,
    Drawer,
    Chip,
    ListItemIcon,
    IconButton,
    } from "@mui/material";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosJWT from '../../config/axiosJWT';
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PostAddIcon from '@mui/icons-material/PostAdd';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ForumIcon from '@mui/icons-material/Forum';
import HistoryIcon from '@mui/icons-material/History';

import { logoutUser } from '../../services/api/authApi';

export default function UserSidebar({ mobileMenuOpen, onMobileMenuClose }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();

    const [postsOpen, setPostsOpen] = useState(false);
    const [roomsOpen, setRoomsOpen] = useState(false);
    const [balance, setBalance] = useState(0);
    const [islandorActive, setIslandorActive] = useState(false);
    const [islandorExpiresAt, setIslandorExpiresAt] = useState(null);
    const [islandorRemaining, setIslandorRemaining] = useState('');
    const currentUser = useSelector((s) => s.auth.login?.currentUser);

    const menuItems = [
        { text: "Thông tin cá nhân ", path: "/user/profile", icon: <AccountCircleIcon /> },
        { text: "Phòng đã thuê", path: "/user/my-rentals", icon: <MeetingRoomIcon /> },
        { text: "Hộp thư chat", path: "/user/chat", icon: <ForumIcon /> },
        { text: "Rút tiền", path: "/user/withdraw", icon: <AccountBalanceWalletIcon /> },
        { text: "Lịch sử rút tiền", path: "/user/withdrawalhistory", icon: <HistoryIcon /> },
        { text: "Gói dịch vụ", path: "/user/islandor", icon: <DescriptionIcon /> },
        { text: "Đổi mật khẩu", path: "/user/change-password", icon: <LockIcon /> },
        { text: "Thông báo", path: "/user/notifications", icon: <NotificationsNoneIcon /> },
        { text: "Bảng giá dịch vụ", path: "/user/pricing", icon: <DescriptionIcon /> },
        { text: "Liên hệ & trợ giúp", path: "/user/support", icon: <ContactSupportIcon /> },
        { text: "Đăng xuất", path: "/logout", icon: <ExitToAppIcon /> },
    ];

    const isUserRole = (currentUser?.role || 'user') === 'user';
    const sidebarMenuHiddenForUser = ['/user/islandor', '/user/change-password', '/user/pricing'];
    const visibleMenuItems = isUserRole
        ? menuItems.filter((item) => !sidebarMenuHiddenForUser.includes(item.path))
        : menuItems;

    const handleMenuClick = async (path) => {
        if (path === "/logout") {
            try {
                // call logout API which clears server-side refresh token cookie and clears retoken
                await logoutUser(dispatch, navigate);
            } catch (err) {
                // even if API fails, logoutUser will dispatch logout and navigate
                console.error('Logout error:', err);
            }
        } else {
            navigate(path);
        }

        // Đóng mobile menu sau khi click
        if (onMobileMenuClose) {
            onMobileMenuClose();
        }
    };

    const drawerWidth = 240;

    // load wallet balance từ API wallet (cùng nguồn với trang Rút tiền)
    const loadBalance = async () => {
        try {
            if (!currentUser?._id) {
                setBalance(0);
                return;
            }
            const res = await axiosJWT.get('/api/payments/wallet');
            const w = res.data?.wallet;
            setBalance(w != null ? Number(w.balance || 0) : 0);
        } catch (err) {
            console.error('load balance error', err);
            setBalance(0);
        }
    };

    // load islandor status
    const loadIslandor = async () => {
        try {
            if (!currentUser?._id) {
                setIslandorActive(false);
                setIslandorExpiresAt(null);
                setIslandorRemaining('');
                return;
            }
            const res = await axiosJWT.get('/api/payments/islandor');
            if (res.data && res.data.success) {
                const { isActive, expiresAt } = res.data;
                setIslandorActive(Boolean(isActive));
                setIslandorExpiresAt(expiresAt ? new Date(expiresAt).toISOString() : null);
            } else {
                setIslandorActive(false);
                setIslandorExpiresAt(null);
            }
        } catch (err) {
            console.error('load islandor error', err);
            setIslandorActive(false);
            setIslandorExpiresAt(null);
        }
    };

    useEffect(() => {
        // initial load
        loadBalance();
        loadIslandor();

        // update remaining text every second
        let mounted = true;
        const updateRemaining = () => {
            if (!mounted) return;
            if (!islandorExpiresAt) {
                setIslandorRemaining('');
                return;
            }
            const now = new Date();
            const exp = new Date(islandorExpiresAt);
            const diff = exp - now;
            if (diff <= 0) {
                setIslandorRemaining('Hết hạn');
                setIslandorActive(false);
                return;
            }
            const days = Math.floor(diff / (24 * 60 * 60 * 1000));
            const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
            const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
            const parts = [];
            if (days > 0) parts.push(`${days}d`);
            if (hours > 0) parts.push(`${hours}h`);
            if (minutes >= 0 && days === 0) parts.push(`${minutes}m`);
            setIslandorRemaining(parts.join(' '));
        };

        const interval = setInterval(updateRemaining, 1000);

        // event listeners to refresh when purchase or wallet change
        const onWalletUpdated = () => { loadBalance(); };
        const onIslandorUpdated = () => { loadIslandor(); };
        window.addEventListener('walletUpdated', onWalletUpdated);
        window.addEventListener('islandorUpdated', onIslandorUpdated);

        // run one immediate update
        updateRemaining();

        return () => {
            mounted = false;
            clearInterval(interval);
            window.removeEventListener('walletUpdated', onWalletUpdated);
            window.removeEventListener('islandorUpdated', onIslandorUpdated);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, islandorExpiresAt]);

        const sidebarContent = (
            <Box
                sx={{
                    width: drawerWidth,
                    background: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    p: 2,
                    height: '100%',
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.25,
                    boxShadow: 'none',
                    borderRight: `1px solid ${theme.palette.divider}`,
                }}
            >
                {/* User ID + balance (replace avatar) */}
                <Box display="flex" flexDirection="column" alignItems="flex-start" gap={0.5} mb={0.5}>
                    <Typography variant="overline" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>TÀI KHOẢN CỦA BẠN</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                        {currentUser?.id || currentUser?._id || 'Khách'}
                    </Typography>
                    <Chip
                        icon={<AccountBalanceWalletIcon />}
                        label={`Số dư: ${Number(balance || 0).toLocaleString('vi-VN')} đ`}
                        id="sidebar-wallet-chip"
                        sx={{ borderRadius: 3, bgcolor: theme.palette.grey[100] }}
                    />
                </Box>

                <Divider />

                {/* Menu list */}
                <List disablePadding>
                    {/* Collapsible: Quản lý tin đăng */}
                    <ListItemButton
                        onClick={() => setPostsOpen((v) => !v)}
                        sx={{ borderRadius: 2, py: 0.8, mb: 0.5 }}
                    >
                        <ListItemIcon>
                            <PostAddIcon />
                        </ListItemIcon>
                        <Typography fontWeight={500} fontSize={15} flex={1}>Quản lý tin đăng</Typography>
                        {postsOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </ListItemButton>
                    {postsOpen && (
                        <Box pl={3}>
                            <ListItemButton
                                onClick={() => handleMenuClick('/user/post-room')}
                                sx={{ borderRadius: 2, py: 0.8, mb: isUserRole ? 0 : 0.5 }}
                            >
                                <Typography fontSize={14}>Đăng tin cho thuê phòng</Typography>
                            </ListItemButton>
                            {!isUserRole && (
                                <ListItemButton onClick={() => handleMenuClick('/user/invite-roommate')} sx={{ borderRadius: 2, py: 0.8 }}>
                                    <Typography fontSize={14}>Đăng tin tìm bạn ở ghép</Typography>
                                </ListItemButton>
                            )}
                        </Box>
                    )}
                    {/* Quản lý phòng */}
                    <ListItemButton
                        onClick={() => handleMenuClick('/user/manage-rooms')}
                        sx={{ borderRadius: 2, py: 0.8, mb: 0.5 }}
                    >
                        <ListItemIcon>
                            <MeetingRoomIcon />
                        </ListItemIcon>
                        <Typography fontWeight={500} fontSize={15} flex={1}>Quản lý phòng (chủ trọ)</Typography>
                    </ListItemButton>
                    <ListItemButton
                        onClick={() => handleMenuClick('/user/owner-checkout-requests')}
                        sx={{ borderRadius: 2, py: 0.8, mb: 0.5 }}
                    >
                        <ListItemIcon>
                            <MeetingRoomIcon />
                        </ListItemIcon>
                        <Typography fontWeight={500} fontSize={15} flex={1}>Yêu cầu trả phòng (chủ trọ)</Typography>
                    </ListItemButton>
                    <ListItemButton
                        onClick={() => handleMenuClick('/user/owner-extend-requests')}
                        sx={{ borderRadius: 2, py: 0.8, mb: 0.5 }}
                    >
                        <ListItemIcon>
                            <MeetingRoomIcon />
                        </ListItemIcon>
                        <Typography fontWeight={500} fontSize={15} flex={1}>Yêu cầu gia hạn thêm tháng (chủ trọ)</Typography>
                    </ListItemButton>

                    {visibleMenuItems.map((item, idx) => (
                        <ListItemButton
                            key={idx}
                            onClick={() => handleMenuClick(item.path)}
                            sx={{
                                borderRadius: 2,
                                py: 1,
                                mb: 0.5,
                                alignItems: 'center',
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36, color: theme.palette.text.secondary }}>
                                {item.icon}
                            </ListItemIcon>
                            <Typography sx={{ flex: 1 }}>{item.text}</Typography>
                            {item.path === '/user/islandor' && (
                                <Chip
                                    size="small"
                                    label={islandorRemaining || (islandorActive ? 'Đang hoạt động' : 'Hết hạn')}
                                    color={islandorActive ? 'success' : 'default'}
                                    sx={{ mr: 1 }}
                                />
                            )}
                            <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                                <ChevronRightIcon fontSize="small" />
                            </IconButton>
                        </ListItemButton>
                    ))}
                </List>
            </Box>
    );

    return (
        <>
            {/* Desktop Sidebar - luôn hiện */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: drawerWidth,
                    flexShrink: 0,
                }}
            >
                {sidebarContent}
            </Box>

            {/* Mobile Drawer - chỉ hiện khi mở */}
            <Drawer
                variant="temporary"
                open={mobileMenuOpen}
                onClose={onMobileMenuClose}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        border: 'none'
                    },
                }}
            >
                {sidebarContent}
            </Drawer>
        </>
    );
}
