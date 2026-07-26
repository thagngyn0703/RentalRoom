// ForgotPassword.jsx
import React, { useState } from 'react';
import { Button, TextField, Typography, Container, Paper } from '@mui/material';
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css'; // Import CSS riêng

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email là bắt buộc');
      return;
    }

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      if (response?.data?.success) {
        setInfo('Mã xác minh đã được gửi tới email của bạn.');
        navigate(`/verifycode?email=${email}`);
      } else {
        setError(response?.data?.error || 'Không gửi được mã xác minh.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Lỗi máy chủ');
    }
  };

  return (
    <Container maxWidth="xs" className="forgot-password-container">
      <Paper elevation={3} className="forgot-password-paper">
        <Typography variant="h4">Quên mật khẩu</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          {error && <Typography color="error" mt={2}>{error}</Typography>}
          {info && <Typography color="primary" mt={2}>{info}</Typography>}
          <Button type="submit" variant="contained" fullWidth sx={{ marginTop: 2 }}>
            Gửi mã xác minh
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
