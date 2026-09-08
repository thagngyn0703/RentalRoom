import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import AppsIcon from '@mui/icons-material/Apps';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PeopleIcon from '@mui/icons-material/People';

import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const drawerWidth = 260;

const adminMenu = [
  {
    label: 'Quản lý đặt phòng',
    icon: <MonetizationOnIcon color="primary" />,
    path: '/admin/bookings',
  },
  {
    label: 'Quản lý trả phòng',
    icon: <MonetizationOnIcon color="primary" />,
    path: '/admin/checkout',
  },
  {
    label: 'Yêu cầu đặt cọc',
    icon: <MonetizationOnIcon color="primary" />,
    path: '/admin/deposits',
  },
  {
    label: 'Yêu cầu trả phòng sớm',
    icon: <MonetizationOnIcon color="primary" />,
    path: '/admin/early-checkout',
  },
  {
    label: 'Quản lý bài đăng',
    icon: <HomeWorkIcon color="primary" />,
    path: '/admin/posts',
  },
  {
    label: 'Quản lý hỗ trợ',
    icon: <ContactSupportIcon color="primary" />,
    path: '/admin/viewsupport',
  },
  {
    label: 'Quản lý tài khoản',
    icon: <AccountCircleIcon color="primary" />,
    path: '/admin/users',
  },
  {
    label: 'Yêu cầu rút tiền',
    icon: <MonetizationOnIcon color="primary" />,
    path: '/admin/withdrawals',
  },
  {
    label: 'Xem website',
    icon: <PeopleIcon color="primary" />,
    path: '/',
  },
];

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#f8fafd',
          borderRight: '1px solid #e0e0e0',
          pt: 0.5,
          borderTopRightRadius: 32,
          borderBottomRightRadius: 32,
          boxShadow: '2px 0 16px 0 rgba(25, 118, 210, 0.07)',
        },
      }}
    >
      {/* Logo nhỏ phía trên */}
      <Toolbar sx={{ minHeight: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AppsIcon sx={{ fontSize: 36, color: '#1976d2', filter: 'drop-shadow(0 2px 8px #e3f2fd)' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1976d2', letterSpacing: 1 }}>
            ADMIN
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ mt: 1 }}>
        {adminMenu.map((item) => (
          <ListItem
            button
            key={item.label}
            onClick={() => item.path && navigate(item.path)}
            selected={item.path && location.pathname.startsWith(item.path)}
            sx={{
              pl: 2.5,
              py: 1.5,
              borderRadius: 3,
              mx: 1,
              mb: 1,
              bgcolor: item.path && location.pathname.startsWith(item.path) ? '#1c6dc9' : 'inherit',
              color: '#222',
              fontWeight: item.path && location.pathname.startsWith(item.path) ? 700 : 600,
              fontSize: 17,
              boxShadow: item.path && location.pathname.startsWith(item.path) ? '0 4px 16px 0 rgba(25, 118, 210, 0.13)' : 'none',
              transition: 'all 0.22s',
              '&:hover': {
                bgcolor: item.path && location.pathname.startsWith(item.path) ? '#0977e6' : '#050607',
                color: '#1976d2',
                fontWeight: 700,
              },
            }}
          >
            <ListItemIcon sx={{ color: '#1976d2', minWidth: 40, fontSize: 26 }}>{React.cloneElement(item.icon, { fontSize: 'large' })}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: item.path && location.pathname.startsWith(item.path) ? 700 : 600, fontSize: 17, color: '#222' }} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6fb' }}>
      <CssBaseline />
      <AdminSidebar />
      <Box component="main" sx={{ flex: 1, p: { xs: 1, md: 3 }, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Nội dung chính bo góc, shadow */}
        <Box sx={{
          flex: 1,
          bgcolor: '#fff',
          borderRadius: 3,
          boxShadow: '0 2px 16px 0 rgba(25, 118, 210, 0.07)',
          p: { xs: 1.5, md: 3 },
          minHeight: 0,
          overflow: 'auto',
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
