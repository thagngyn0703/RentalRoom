import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Box,
  Avatar,
  colors
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Home,
  ManageAccounts,
  HomeWork,
  HelpOutline,
  Description,
  Menu as MenuIcon
} from '@mui/icons-material';
import { logoutUser } from '../../services/api/authApi';
import { FavoriteApi } from '../../services/api';
import theme from '../../theme/theme';
import MenuMobile from '../Dashboard/MenuMobile';
import NotificationBadge from '../Chat/NotificationBadge';
import NotificationBellBadge from '../Notifications/NotificationBellBadge';

const NavBar = () => {
  const user = useSelector((state) => state.auth.login.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const location = useLocation();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = () => {
    setMobileMenuOpen(true);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logoutUser(dispatch, navigate);
    handleClose(); // Đóng menu sau khi logout
  };

  useEffect(() => {
    const readFav = async () => {
      try {
        if (user) {
          const res = await FavoriteApi.getMyFavorites();
          const ids = (res?.favorites || []).map(f => String(f.room?._id || f.clientRoomId || f.room));
          setFavCount(ids.length);
        } else {
          // anonymous users keep favorites in-memory only; show 0 here
          setFavCount(0);
        }
      } catch (err) {
        console.error('Error reading favorites for NavBar:', err);
        setFavCount(0);
      }
    };
    readFav();
    const onFavUpdate = () => readFav();
    window.addEventListener('favoritesUpdated', onFavUpdate);
    return () => {
      window.removeEventListener('favoritesUpdated', onFavUpdate);
    };
  }, []);


  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(255,255,255,.97)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(8, 127, 114, 0.1)',
        boxShadow: 'none',
        height: 80,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', height: '100%', px: { xs: 2, md: 3, lg: 4 } }}>
        {/* Mobile Menu Button - Show on screens < 1000px */}
        <IconButton
          aria-label="Mở menu điều hướng"
          color="inherit"
          onClick={handleMobileMenuOpen}
          sx={{
            display: { xs: 'flex', lg: 'none' },
            mr: 1
          }}
        >
          <MenuIcon sx={{ color: "primary.main" }} />
        </IconButton>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              color: 'primary.dark',
              borderRadius: 3,
              px: 0,
              py: 1.2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(8, 127, 114, 0.35), 0 3px 6px rgba(8, 127, 114, 0.2)',
              }
            }}
          >
            <HomeWork sx={{ fontSize: 32 }} />
            <Box component="span" sx={{ fontSize: 25, fontWeight: 800, letterSpacing: '-1px', whiteSpace: 'nowrap' }}>trọ chung.</Box>
          </Box>
        </Link>


        {/* Navigation Menu - Hide on screens < 1000px */}
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 1, alignItems: 'center' }}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            startIcon={<Home sx={{ fontSize: 20 }} />}
            sx={{
              color: location.pathname === '/' ? '#193b34' : '#087f72',
              textTransform: 'none',
              fontWeight: location.pathname === '/' ? 700 : 600,
              fontSize: '0.95rem',
              px: 2.5,
              py: 1.2,
              borderRadius: 2.5,
              position: 'relative',
              transition: 'all 0.3s ease',
              bgcolor: location.pathname === '/' ? 'rgba(25, 59, 52, 0.08)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(8, 127, 114, 0.1)',
                transform: 'translateY(-2px)',
              },
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: location.pathname === '/' ? 'translateX(-50%) scaleX(1)' : 'translateX(-50%) scaleX(0)',
                width: '70%',
                height: 2,
                background: 'linear-gradient(90deg, #087f72 0%, #193b34 100%)',
                borderRadius: 1,
                transition: 'transform 0.3s ease',
              },
              '&:hover:after': {
                transform: 'translateX(-50%) scaleX(1)',
              }
            }}
          >
            Trang chủ
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/rooms"
            startIcon={<HomeWork sx={{ fontSize: 20 }} />}
            sx={{
              color: location.pathname === '/rooms' ? '#193b34' : '#087f72',
              textTransform: 'none',
              fontWeight: location.pathname === '/rooms' ? 700 : 600,
              fontSize: '0.95rem',
              px: 2.5,
              py: 1.2,
              borderRadius: 2.5,
              position: 'relative',
              transition: 'all 0.3s ease',
              bgcolor: location.pathname === '/rooms' ? 'rgba(25, 59, 52, 0.08)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(8, 127, 114, 0.1)',
                transform: 'translateY(-2px)',
              },
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: location.pathname === '/rooms' ? 'translateX(-50%) scaleX(1)' : 'translateX(-50%) scaleX(0)',
                width: '70%',
                height: 2,
                background: 'linear-gradient(90deg, #087f72 0%, #193b34 100%)',
                borderRadius: 1,
                transition: 'transform 0.3s ease',
              },
              '&:hover:after': {
                transform: 'translateX(-50%) scaleX(1)',
              }
            }}
          >
            Nhà trọ
          </Button>


          <Button
            color="inherit"
            component={Link}
            to="/about"
            startIcon={<HelpOutline sx={{ fontSize: 20 }} />}
            sx={{
              color: location.pathname === '/about' ? '#193b34' : '#087f72',
              textTransform: 'none',
              fontWeight: location.pathname === '/about' ? 700 : 600,
              fontSize: '0.95rem',
              px: 2.5,
              py: 1.2,
              borderRadius: 2.5,
              position: 'relative',
              transition: 'all 0.3s ease',
              bgcolor: location.pathname === '/about' ? 'rgba(25, 59, 52, 0.08)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(8, 127, 114, 0.1)',
                transform: 'translateY(-2px)',
              },
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: location.pathname === '/about' ? 'translateX(-50%) scaleX(1)' : 'translateX(-50%) scaleX(0)',
                width: '70%',
                height: 2,
                background: 'linear-gradient(90deg, #087f72 0%, #193b34 100%)',
                borderRadius: 1,
                transition: 'transform 0.3s ease',
              },
              '&:hover:after': {
                transform: 'translateX(-50%) scaleX(1)',
              }
            }}
          >
            Về chúng tôi
          </Button>
          <Button component={Link} to="/docs" startIcon={<Description />} aria-current={location.pathname === '/docs' ? 'page' : undefined}
            sx={{ color: location.pathname === '/docs' ? 'primary.dark' : 'primary.main', bgcolor: location.pathname === '/docs' ? 'rgba(25,59,52,.08)' : 'transparent', px: 2.5, py: 1.2, borderRadius: 2.5, fontWeight: 700 }}>
            Tài liệu
          </Button>

        </Box>

        {/* Right Side - User Menu - Hide on screens < 1000px */}
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              <NotificationBadge />
              <NotificationBellBadge />
              <Button
                variant="contained"
                component={Link}
                to={user?.role === 'admin' ? "/admin" : "/user/profile"}
                startIcon={<ManageAccounts />}
                sx={{
                  background: 'linear-gradient(135deg, #087f72 0%, #193b34 100%)',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  px: 3,
                  py: 1,
                  borderRadius: 2.5,
                  boxShadow: '0 4px 12px rgba(8, 127, 114, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #075b51 0%, #123d35 100%)',
                    boxShadow: '0 6px 16px rgba(8, 127, 114, 0.4)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                {user?.role === 'admin' ? 'Admin' : 'Quản lý'}
              </Button>

              <IconButton
                size="large"
                onClick={handleMenu}
                sx={{
                  p: 0,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}
              >
                <Avatar
                  sx={{
                    background: 'linear-gradient(135deg, #087f72 0%, #193b34 100%)',
                    color: 'white',
                    width: 40,
                    height: 40,
                    fontWeight: 700,
                    boxShadow: '0 3px 8px rgba(8, 127, 114, 0.3)',
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                  }}
                  alt={user.username}
                >
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {user?.role === 'admin' && (
                  <>
                    <MenuItem onClick={handleClose} component={Link} to="/admin/confirm-payment">
                      Xác nhận thanh toán
                    </MenuItem>
                    <MenuItem onClick={handleClose} component={Link} to="/admin/viewsupport">
                      Quản lý tin hỗ trợ
                    </MenuItem>
                  </>
                )}
                <MenuItem onClick={handleClose} component={Link} to="/user/profile">
                  Thông tin cá nhân
                </MenuItem>
                <MenuItem onClick={handleClose} component={Link} to="/favorites">
                  Phòng yêu thích ({favCount})
                </MenuItem>
                <MenuItem onClick={handleClose} component={Link} to="/user/manage-rooms">
                  Quản lý phòng
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  Đăng xuất
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>


              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{
                  color: '#087f72',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  px: 2.5,
                  py: 1,
                  borderRadius: 2.5,
                  border: '1.5px solid rgba(8, 127, 114, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(8, 127, 114, 0.1)',
                    borderColor: '#087f72',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Đăng nhập
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/register"
                sx={{
                  background: 'linear-gradient(135deg, #087f72 0%, #193b34 100%)',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  px: 3,
                  py: 1,
                  borderRadius: 2.5,
                  boxShadow: '0 4px 12px rgba(8, 127, 114, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #075b51 0%, #123d35 100%)',
                    boxShadow: '0 6px 16px rgba(8, 127, 114, 0.4)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Đăng ký
              </Button>
            </>
          )}
        </Box>
      </Toolbar>

      {/* Mobile Menu Drawer */}
      <MenuMobile
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
      />
    </AppBar>
  );
};

export default NavBar;
