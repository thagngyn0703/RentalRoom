// ResetPassword.jsx
import React, { useMemo, useState } from 'react';
import { Button, TextField, Typography, Container, Paper } from '@mui/material';
import axios from '../../config/axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResetPassword.css'; // CSS tách riêng

function useQuery() {
  const { search } = useLocation();
  // dùng useMemo để ESLint không cảnh báo
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPassword() {
  const q = useQuery();
  const email = q.get('email') || '';
  const code  = q.get('code') || '';
  const navigate = useNavigate();

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');

    if (!email || !code) {
      setErr('Thiếu email hoặc mã xác minh.');
      return;
    }
    if (pw.length < 8) {
      setErr('Mật khẩu phải ≥ 8 ký tự.');
      return;
    }
    if (pw !== pw2) {
      setErr('Mật khẩu nhập lại không khớp.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/api/auth/reset-password', {
        email,
        code,
        newPassword: pw,
      });
      if (res?.data?.success) {
        setOk('Đổi mật khẩu thành công. Bạn sẽ được chuyển đến trang đăng nhập...');
        setTimeout(() => navigate('/login'), 1200);
      } else {
        setErr(res?.data?.error || 'Đổi mật khẩu thất bại.');
      }
    } catch (e) {
      setErr(e?.response?.data?.error || 'Lỗi máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} className="reset-password-paper">
        <Typography variant="h4" align="center" gutterBottom>
          Đặt lại mật khẩu
        </Typography>

        <form onSubmit={submit} className="reset-password-form">
          <TextField
            fullWidth
            label="Mật khẩu mới"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Xác nhận mật khẩu"
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            margin="normal"
            required
          />

          {err && (
            <Typography color="error" sx={{ mt: 1 }}>
              {err}
            </Typography>
          )}
          {ok && (
            <Typography color="primary" sx={{ mt: 1 }}>
              {ok}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Đang thay đổi...' : 'Đổi mật khẩu'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
