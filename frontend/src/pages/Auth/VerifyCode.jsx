// VerifyCode.jsx
import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, Container, Paper, Link } from '@mui/material';
import axios from '../../config/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './VerifyCode.css'; // Import CSS riêng

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

const VerifyCode = () => {
  const query = useQuery();
  const email = query.get('email');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/verify-password-reset-code', { email, code });
      if (response?.data?.success) {
        setInfo('Mã xác minh hợp lệ. Bạn có thể thay đổi mật khẩu.');
        navigate(
          `/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`
        ); 
      } else {
        setError(response?.data?.error || 'Xác minh thất bại');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Lỗi máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError('');
    try {
      const res = await axios.post('/api/auth/resend-code', { email });
      if (res?.data?.success) {
        setInfo('Mã xác minh đã được gửi lại.');
        setCooldown(60);
      } else {
        setError(res?.data?.error || 'Không thể gửi lại mã.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Lỗi máy chủ');
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} className="verify-code-paper">
        <Typography variant="h4">Mã xác minh</Typography>
        <Typography variant="body2" color="text.secondary">
          Một mã xác minh đã được gửi tới email: <b>{email}</b>
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nhập mã"
            variant="outlined"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            inputProps={{ maxLength: 8, style: { letterSpacing: 4, fontWeight: 700 } }}
            required
            margin="normal"
          />
          {error && <Typography color="error" mt={2}>{error}</Typography>}
          {info && <Typography color="primary" mt={2}>{info}</Typography>}
          <Typography variant="body2" mt={1}>
            Không nhận được mã?{' '}
            <Link component="button" onClick={handleResend} disabled={cooldown > 0}>
              {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : 'Gửi lại'}
            </Link>
          </Typography>
          <Button type="submit" variant="contained" fullWidth sx={{ marginTop: 2 }} disabled={loading}>
            {loading ? 'Đang xác minh...' : 'Xác nhận'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default VerifyCode;
