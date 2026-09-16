import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UserSidebar from '../../Components/Dashboard/UserSidebar';

const UserLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Read auth.login from redux store
  const login = useSelector((state) => state.auth?.login);
  const isLoggedIn = Boolean(
    login?.currentUser || (login?.accessToken && String(login.accessToken).trim().length > 0)
  );

  useEffect(() => {
    // If user is not logged in, redirect to login page
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Sidebar */}
      <UserSidebar
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 2, md: 3 },
          backgroundColor: 'background.default',
          minWidth: 0,
          overflow: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <IconButton aria-label="Mở menu tài khoản" onClick={handleMobileMenuToggle} sx={{ display: { xs: 'inline-flex', md: 'none' } }}><MenuIcon /></IconButton>
          <Box><Typography variant="overline" color="primary">KHÔNG GIAN CỦA BẠN</Typography><Typography variant="h6">Tài khoản & quản lý</Typography></Box>
        </Box>
        <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3, p: { xs: 1.5, md: 3 }, minWidth: 0 }}><Outlet /></Box>
      </Box>
    </Box>
  );
};

export default UserLayout;
