import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axiosJWT from '../../../config/axiosJWT';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../Components/ToastProvider';

const packages = [
  { key: '1m', title: 'Gói 1 tháng', price: 50000, subtitle: '1 tháng' },
  { key: '3m', title: 'Gói 3 tháng', price: 120000, subtitle: '3 tháng' },
  { key: '6m', title: 'Gói 6 tháng', price: 210000, subtitle: '6 tháng' },
];

const Pricing = () => {
  const [wallet, setWallet] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadWallet = async () => {
    try {
      const res = await axiosJWT.get('/api/payments/wallet');
      if (res.data && res.data.success) setWallet(Number(res.data.wallet.balance || 0));
    } catch (err) {
      console.error('load wallet', err);
    }
  };

  useEffect(() => { loadWallet(); }, []);

  const handleBuy = async (pkg) => {
    setLoading(true);
    try {
      const res = await axiosJWT.post('/api/payments/purchase', { packageKey: pkg.key });
      if (res.data && res.data.success) {
        showToast('Mua gói thành công', 'success');
        setWallet(Number(res.data.wallet.balance || 0));
        // Notify other parts of the app to refresh wallet / islandor status
        try {
          window.dispatchEvent(new Event('walletUpdated'));
          window.dispatchEvent(new Event('islandorUpdated'));
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      console.error('purchase err', err);
      const status = err?.response?.status;
      if (status === 402) {
        // insufficient -> redirect to /user/paying with package price
        const required = err.response.data?.required || pkg.price;
        showToast('Không đủ tiền, chuyển sang trang nạp tiền', 'warning');
        navigate(`/user/paying/${required}`);
      } else {
        showToast(err?.response?.data?.message || 'Lỗi khi mua gói', 'error');
      }
    } finally { setLoading(false); }
  };

  const openConfirm = (pkg) => {
    setSelectedPkg(pkg);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setSelectedPkg(null);
  };

  const confirmPurchase = async () => {
    if (!selectedPkg) return;
    await handleBuy(selectedPkg);
    // close dialog after attempt (either success or error which may have navigated away)
    closeConfirm();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Bảng giá dịch vụ</Typography>
      <Typography sx={{ mb: 2 }}>Số dư ví: <Chip label={`${wallet.toLocaleString('vi-VN')} đ`} color="primary" /></Typography>
      <Grid container spacing={2}>
        {packages.map(p => {
          const isRecommended = p.key === '3m';
          return (
            <Grid item xs={12} sm={6} md={4} key={p.key}>
              <Box sx={{ position: 'relative' }}>
                {isRecommended && (
                  <Chip label="ĐỀ XUẤT" color="secondary" size="small" sx={{ position: 'absolute', right: 12, top: -12, zIndex: 2 }} />
                )}
                <Paper
                  elevation={isRecommended ? 8 : 3}
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: 220,
                    borderRadius: 2,
                    transition: 'transform 180ms ease, box-shadow 180ms ease',
                    transform: 'translateY(0)',
                    bgcolor: isRecommended ? 'primary.main' : 'background.paper',
                    color: isRecommended ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: isRecommended ? 12 : 6,
                    }
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{p.title}</Typography>
                    <Typography variant="h3" sx={{ my: 1, fontWeight: 900 }}>{p.price.toLocaleString('vi-VN')} đ</Typography>
                    <Typography variant="body1" sx={{ mb: 2, opacity: 0.95 }}>{p.subtitle}</Typography>
                  </Box>

                  <Button
                    fullWidth
                    onClick={() => openConfirm(p)}
                    disabled={loading}
                    variant={isRecommended ? 'contained' : 'outlined'}
                    sx={isRecommended ? { bgcolor: 'common.white', color: 'primary.main', fontWeight: 700, '&:hover': { bgcolor: 'grey.100' } } : {}}
                  >
                    Mua gói
                  </Button>
                </Paper>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={confirmOpen} onClose={closeConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>Xác nhận mua gói</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>{selectedPkg?.title}</Typography>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>{selectedPkg ? selectedPkg.price.toLocaleString('vi-VN') + ' đ' : ''}</Typography>
          <Typography variant="body2" color="text.secondary">Số dư hiện tại: {wallet.toLocaleString('vi-VN')} đ</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Bạn có chắc muốn mua gói này không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm} disabled={loading}>Hủy</Button>
          <Button onClick={confirmPurchase} variant="contained" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Xác nhận mua'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Pricing;
