import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NoPermission = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f7f7fa',
      px: 2
    }}>
      <ErrorOutlineIcon sx={{ fontSize: 80, color: '#ff9800', mb: 2 }} />
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>
        Bạn không có quyền truy cập
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: '#666', textAlign: 'center', maxWidth: 400 }}>
        Trang này yêu cầu quyền hạn cao hơn. Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là nhầm lẫn.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/')} sx={{ borderRadius: 2, px: 4, py: 1 }}>
        Quay lại
      </Button>
    </Box>
  );
};

export default NoPermission;
