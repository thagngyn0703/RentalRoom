import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import axiosJWT from '../../../config/axiosJWT';
import { createWithdrawal } from '../../../services/api/withdrawalApi';
import { uploadFiles } from '../../../services/api/postApi';
import { useToast } from '../../../Components/ToastProvider';

const COMMISSION_PERCENT = 10;

const Withdraw = () => {
  const [walletBalance, setWalletBalance] = useState(null);
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  /** Chỉ lưu File từ máy — không có ô nhập URL/chữ */
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const qrInputRef = useRef(null);
  const { showToast } = useToast();

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(true);

  useEffect(() => {
    return () => {
      if (qrPreview) URL.revokeObjectURL(qrPreview);
    };
  }, [qrPreview]);

  const fetchWallet = async () => {
    try {
      const res = await axiosJWT.get('/api/payments/wallet');
      const w = res.data?.wallet;
      setWalletBalance(w != null ? Number(w.balance || 0) : 0);
    } catch {
      setWalletBalance(0);
    } finally {
      setLoadingWallet(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const numAmount = Math.max(0, Number(String(amount).replace(/\D/g, '')) || 0);
  const commission = Math.floor((numAmount * COMMISSION_PERCENT) / 100);
  const receiveAmount = numAmount - commission;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (numAmount < 1000) {
      showToast('Số tiền rút tối thiểu 1.000', 'error');
      return;
    }
    if (!bankAccountName.trim() || !bankAccountNumber.trim()) {
      showToast('Vui lòng nhập tên và số tài khoản', 'error');
      return;
    }
    if (walletBalance != null && numAmount > walletBalance) {
      showToast('Số dư không đủ', 'error');
      return;
    }
    setLoading(true);
    try {
      let bankQrImageUrl;
      if (qrFile) {
        const urls = await uploadFiles([qrFile], 'withdrawals/qr', 2);
        bankQrImageUrl = urls.find((u) => typeof u === 'string' && u);
        if (!bankQrImageUrl) {
          showToast('Upload ảnh QR thất bại', 'error');
          setLoading(false);
          return;
        }
      }
      await createWithdrawal({
        amount: numAmount,
        bankAccountName: bankAccountName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        bankQrImage: bankQrImageUrl || undefined,
      });
      showToast('Vui lòng chờ ít phút. Yêu cầu rút tiền đã được gửi.', 'success');
      setAmount('');
      setQrFile(null);
      setQrPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      if (qrInputRef.current) qrInputRef.current.value = '';
      fetchWallet();
      window.dispatchEvent(new Event('walletUpdated'));
    } catch (err) {
      const msg = err?.response?.data?.message || 'Gửi yêu cầu thất bại';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingWallet) {
    return <Typography color="text.secondary">Đang tải...</Typography>;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 560, mx: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Rút tiền
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography color="text.secondary">Số dư hiện tại</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {walletBalance != null ? walletBalance.toLocaleString('vi-VN') : '0'} đ
        </Typography>
      </Paper>

      <Paper component="form" onSubmit={handleSubmit} elevation={1} sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="Tên chủ tài khoản"
            value={bankAccountName}
            onChange={(e) => setBankAccountName(e.target.value)}
            fullWidth
            required
            size="small"
          />
          <TextField
            label="Số tài khoản"
            value={bankAccountNumber}
            onChange={(e) => setBankAccountNumber(e.target.value)}
            fullWidth
            required
            size="small"
          />
          <Box>
            <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary' }}>
              Ảnh QR ngân hàng <Typography component="span" color="text.disabled">(không bắt buộc)</Typography>
            </Typography>
            <input
              ref={qrInputRef}
              type="file"
              accept="image/*"
              tabIndex={-1}
              aria-hidden
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (!/^image\//.test(f.type)) {
                  showToast('Chỉ chấp nhận file ảnh', 'error');
                  e.target.value = '';
                  return;
                }
                setQrPreview((prev) => {
                  if (prev) URL.revokeObjectURL(prev);
                  return URL.createObjectURL(f);
                });
                setQrFile(f);
              }}
            />
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={() => qrInputRef.current?.click()}
              >
                Chọn ảnh từ máy
              </Button>
              {qrFile && (
                <Button type="button" size="small" color="error" onClick={() => {
                  setQrFile(null);
                  setQrPreview((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return null;
                  });
                  if (qrInputRef.current) qrInputRef.current.value = '';
                }}>
                  Bỏ ảnh
                </Button>
              )}
            </Stack>
            {qrPreview && (
              <Box sx={{ mt: 1, maxWidth: 200, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <img src={qrPreview} alt="QR xem trước" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </Box>
            )}
          </Box>
          <TextField
            label="Số tiền rút (đ)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            required
            size="small"
            placeholder="1000000"
            type="number"
            inputProps={{ min: 1000 }}
          />

          {numAmount >= 1000 && (
            <>
              <Divider />
              <Typography variant="body2" color="text.secondary">
                Chiết khấu {COMMISSION_PERCENT}%: {commission.toLocaleString('vi-VN')} đ
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Bạn sẽ nhận: {receiveAmount.toLocaleString('vi-VN')} đ
              </Typography>
            </>
          )}

          <Alert severity="info">
            Sau khi gửi, admin sẽ xem và xác nhận. Khi được duyệt, số dư của bạn sẽ bị trừ tương ứng và admin chuyển tiền vào tài khoản của bạn (sau khi trừ chiết khấu).
          </Alert>

          <Button
            type="submit"
            variant="contained"
            disabled={loading || numAmount < 1000}
            sx={{
              background: 'linear-gradient(135deg, #087f72 0%, #193b34 100%)',
              fontWeight: 600,
            }}
          >
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu rút tiền'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Withdraw;
