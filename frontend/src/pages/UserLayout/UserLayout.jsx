import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
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
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
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
          backgroundColor: '#fff',
          minWidth: 0,
          overflow: 'auto',
          mt: { xs: '56px', md: 0 }, // Margin top cho mobile AppBar
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default UserLayout;