import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  IconButton,
  useTheme,
  Avatar
} from '@mui/material';
import {
  Home,
  ManageAccounts,
  HomeWork,
  HelpOutline,
  Description,
  Close as CloseIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  PostAdd as PostAddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const MenuMobile = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.login.currentUser);

  const mainMenuItems = [
    {
      text: 'Trang chủ',
      icon: <Home />,
      path: '/',
    },
    {
      text: 'Nhà trọ',
      icon: <HomeWork />,
      path: '/rooms',
    },
    {
      text: 'About',
      icon: <HelpOutline />,
      path: '/about',
    },
    { text: 'Tài liệu', icon: <Description />, path: '/docs' }
  ];

  const userMenuItems = user ? [
    {
      text: 'Quản lý',
      icon: <ManageAccounts />,
      path: '/manage',
    },
    {
      text: 'Thông tin cá nhân',
      icon: <PersonIcon />,
      path: '/profile',
    },
    {
      text: 'Quản lý phòng',
      icon: <PostAddIcon />,
      path: '/user/manage-rooms',
    }
  ] : [
    {
      text: 'Quản lý',
      icon: <ManageAccounts />,
      path: '/manage',
    },
    {
      text: 'Đăng nhập',
      icon: <PersonIcon />,
      path: '/login',
    },
    {
      text: 'Đăng ký',
      icon: <PostAddIcon />,
      path: '/register',
    }
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logout clicked');
    localStorage.removeItem('token');
    navigate('/');
    onClose();
  };

  const renderMenuItems = (items) => (
    <List sx={{ py: 0 }}>
      {items.map((item) => (
        <ListItem
          key={item.text}
          sx={{
            px: 2,
            py: 1.5,
            cursor: 'pointer',
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&:active': {
              backgroundColor: theme.palette.action.selected,
            }
          }}
          onClick={() => handleMenuClick(item.path)}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: theme.palette.primary.main
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            sx={{
              '& .MuiListItemText-primary': {
                fontSize: '1rem',
                fontWeight: 500
              }
            }}
          />
        </ListItem>
      ))}
    </List>
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            backgroundColor: theme.palette.primary.main,
            color: 'white'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Logo
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* User Info - Only show if user is logged in */}
        {user && (
          <Box
            sx={{
              p: 2,
              backgroundColor: theme.palette.grey[50],
              borderBottom: `1px solid ${theme.palette.divider}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar 
                sx={{ 
                  bgcolor: '#f39c12', 
                  width: 40, 
                  height: 40,
                  mr: 2
                }}
                alt={user.username}
              >
                {user.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {user.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email || 'user@example.com'}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Menu Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {/* Main Navigation */}
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 1,
              color: theme.palette.text.secondary,
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
          >
            Điều hướng
          </Typography>
          {renderMenuItems(mainMenuItems)}

          <Divider sx={{ my: 1 }} />

          {/* User Menu */}
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 1,
              color: theme.palette.text.secondary,
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
          >
            {user ? 'Tài khoản' : 'Xác thực'}
          </Typography>
          {renderMenuItems(userMenuItems)}
        </Box>

        {/* Footer - Logout (Only show if user is logged in) */}
        {user && (
          <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
            <ListItem
              sx={{
                px: 2,
                py: 1.5,
                cursor: 'pointer',
                borderRadius: 1,
                mx: 1,
                '&:hover': {
                  backgroundColor: theme.palette.error.light,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.error.main,
                  },
                  '& .MuiListItemText-primary': {
                    color: theme.palette.error.main,
                  }
                }
              }}
              onClick={handleLogout}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Đăng xuất"
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '1rem',
                    fontWeight: 500
                  }
                }}
              />
            </ListItem>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default MenuMobile;
