import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { HomeWorkOutlined, SupportAgent, PeopleOutline, AccountBalanceWalletOutlined, Menu as MenuIcon, ArrowBack, Close } from '@mui/icons-material';

const drawerWidth = 264;
const adminMenu = [
  ['Quản lý đặt phòng', '/admin/bookings', AccountBalanceWalletOutlined],
  ['Quản lý trả phòng', '/admin/checkout', HomeWorkOutlined],
  ['Yêu cầu đặt cọc', '/admin/deposits', AccountBalanceWalletOutlined],
  ['Yêu cầu trả phòng sớm', '/admin/early-checkout', HomeWorkOutlined],
  ['Quản lý bài đăng', '/admin/posts', HomeWorkOutlined],
  ['Quản lý hỗ trợ', '/admin/viewsupport', SupportAgent],
  ['Quản lý tài khoản', '/admin/users', PeopleOutline],
  ['Yêu cầu rút tiền', '/admin/withdrawals', AccountBalanceWalletOutlined],
];
export default function AdminLayout() {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const title = adminMenu.find(([, path]) => pathname.startsWith(path))?.[0] || 'Tổng quan';
  const go = path => { navigate(path); setOpen(false); };
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer variant={desktop ? 'permanent' : 'temporary'} open={desktop || open} onClose={() => setOpen(false)}
        sx={{ width: desktop ? drawerWidth : 0, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, bgcolor: '#fff', borderRight: '1px solid #e1e9e3', p: 2 } }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', py: 2, px: 1, color: 'primary.dark' }}>
          <HomeWorkOutlined /><Typography variant="h5" sx={{ fontWeight: 800 }}>trọ chung.</Typography>
          {!desktop && <IconButton aria-label="Đóng menu quản trị" onClick={() => setOpen(false)} sx={{ ml: 'auto' }}><Close /></IconButton>}
        </Box>
        <Typography variant="overline" sx={{ color: 'text.secondary', px: 1, mt: 3, mb: 1, letterSpacing: 1.5 }}>KHÔNG GIAN QUẢN TRỊ</Typography>
        <List disablePadding>
          {adminMenu.map(([label, path, Icon]) => (
            <ListItemButton key={path} selected={pathname.startsWith(path)} onClick={() => go(path)} sx={{ mb: .75, py: 1.2, px: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 34, color: pathname.startsWith(path) ? 'primary.main' : 'text.secondary' }}><Icon fontSize="small" /></ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontSize: 13, fontWeight: pathname.startsWith(path) ? 700 : 500 }} />
            </ListItemButton>
          ))}
        </List>
        <ListItemButton onClick={() => go('/')} sx={{ mt: 'auto', flexGrow: 0, borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
          <ListItemIcon sx={{ minWidth: 34 }}><ArrowBack fontSize="small" /></ListItemIcon><ListItemText primary="Về website" primaryTypographyProps={{ fontSize: 14 }} />
        </ListItemButton>
      </Drawer>
      <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          {!desktop && <IconButton aria-label="Mở menu quản trị" onClick={() => setOpen(true)}><MenuIcon /></IconButton>}
          <Box><Typography variant="overline" color="text.secondary">QUẢN TRỊ / VẬN HÀNH</Typography><Typography variant="h4">{title}</Typography></Box>
        </Box>
        <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3, p: { xs: 1.5, md: 3 }, overflow: 'auto' }}><Outlet /></Box>
      </Box>
    </Box>
  );
}
