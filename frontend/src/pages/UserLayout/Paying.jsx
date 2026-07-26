import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';
import axiosJWT from '../../config/axiosJWT';
import extendPaymentApi from '../../services/api/extendPaymentApi';

const Paying = () => {
  const { requirepaying } = useParams();
  const location = useLocation();
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const rentalInfo = location.state?.fromRental ? location.state : null;
  const fromDepositState = location.state?.fromDeposit ? location.state : null;
  const extendState = location.state?.fromExtend ? location.state : null;
  const isRentalFlow = Boolean(rentalInfo || fromDepositState || extendState);

  useEffect(() => {
    if (fromDepositState?.remaining != null) {
      setAmount(String(fromDepositState.remaining));
      return;
    }
    if (extendState?.totalToPay != null && extendState.totalToPay > 0) {
      setAmount(String(extendState.totalToPay));
      return;
    }
    if (requirepaying && requirepaying !== 'null') {
      const n = Number(requirepaying);
      if (!Number.isNaN(n) && n > 0) setAmount(String(n));
    }
    if (rentalInfo?.isDeposit && rentalInfo?.depositAmount != null && rentalInfo.depositAmount > 0) {
      setAmount(String(rentalInfo.depositAmount));
    }
    if (rentalInfo?.totalToPay != null && rentalInfo.totalToPay > 0 && !rentalInfo?.isDeposit) {
      setAmount(String(rentalInfo.totalToPay));
    }
  }, [requirepaying, rentalInfo?.depositAmount, rentalInfo?.totalToPay, rentalInfo?.isDeposit, fromDepositState?.remaining]);

  const handleRequest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const body = { amount: Number(amount) || 0 };
      if (extendState?.bookingId) {
        body.bookingId = extendState.bookingId;
        body.newEndDate = extendState.newEndDate;
        body.monthsToAdd = extendState.monthsToAdd;
      } else if (fromDepositState?.depositId) {
        body.depositId = fromDepositState.depositId;
        body.roomId = fromDepositState.roomId;
        body.startDate = fromDepositState.startDate;
        body.endDate = fromDepositState.endDate;
      } else if (rentalInfo?.roomId && rentalInfo?.startDate && rentalInfo?.endDate) {
        body.roomId = rentalInfo.roomId;
        body.startDate = rentalInfo.startDate;
        body.endDate = rentalInfo.endDate;
      }
      if (rentalInfo?.isDeposit === true) body.isDeposit = true;
      const res = extendState?.bookingId
        ? await axiosJWT.post('/api/payments/extend/request', body)
        : await axiosJWT.post('/api/payments/request', body);
      if (res.data && res.data.success) {
        setResult(res.data.data);
      } else {
        alert('Yêu cầu thất bại');
      }
    } catch (err) {
      console.error('request pay error', err);
      const msg = err?.response?.data?.message || 'Lỗi khi tạo yêu cầu thanh toán';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPaid = async () => {
    if (!result) return;
    try {
      if (extendState?.bookingId) {
        const res = await extendPaymentApi.confirmPaid(result.historyId);
        if (res?.success) {
          setConfirmSent(true);
          alert('Đã xác nhận thanh toán. Chờ chủ trọ xử lý.');
        } else {
          alert(res?.message || 'Gửi yêu cầu thất bại');
        }
      } else {
        const payload = { historyId: result.historyId, amount: result.amount };
        const res = await axiosJWT.post('/api/payments/approvals', payload);
        if (res.data && res.data.success) {
          setConfirmSent(true);
          alert('Đã gửi yêu cầu xác nhận thanh toán tới admin');
        } else {
          alert(res.data?.message || 'Gửi yêu cầu thất bại');
        }
      }
    } catch (err) {
      console.error('confirm paid error', err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Lỗi khi gửi yêu cầu xác nhận';
      alert(msg);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {extendState ? 'Gia hạn thuê phòng' : 'Thanh toán thuê phòng'}
      </Typography>
      {!isRentalFlow && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.selected' }}>
          <Typography variant="body2" color="text.secondary">
            Chức năng nạp tiền vào ví đang được ẩn tạm.
          </Typography>
        </Paper>
      )}
      {fromDepositState && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.selected' }}>
          <Typography variant="subtitle2" color="text.secondary">Thanh toán nốt tiền thuê</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>{fromDepositState.roomTitle}</Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Tiền phòng:</strong>{' '}
              {(fromDepositState.months ?? 1)} tháng × {(fromDepositState.pricePerMonth ?? 0).toLocaleString('vi-VN')} = {(fromDepositState.totalRent ?? 0).toLocaleString('vi-VN')} đ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Đã cọc:</strong> {(fromDepositState.depositPaid ?? 0).toLocaleString('vi-VN')} đ
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
              <strong>Còn thanh toán:</strong> {(fromDepositState.remaining ?? 0).toLocaleString('vi-VN')} đ
            </Typography>
          </Box>
        </Paper>
      )}
      {!fromDepositState && rentalInfo && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.selected' }}>
          <Typography variant="subtitle2" color="text.secondary">
            {rentalInfo.isDeposit ? 'Đặt cọc thuê phòng' : 'Thanh toán thuê phòng'}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>{rentalInfo.roomTitle}</Typography>
          {rentalInfo.isDeposit ? (
            <Typography variant="body2" color="text.secondary">
              {rentalInfo.rentalType === 'month' ? '1 tháng' : '1 ngày'} — {(rentalInfo.total ?? 0).toLocaleString('vi-VN')} VND
            </Typography>
          ) : (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Tiền phòng:</strong>{' '}
                {rentalInfo.rentalType === 'month'
                  ? `${rentalInfo.quantity} tháng × ${(rentalInfo.pricePerMonth ?? 0).toLocaleString('vi-VN')} = ${(rentalInfo.total ?? 0).toLocaleString('vi-VN')} VND`
                  : `${rentalInfo.quantity} ngày × ${(rentalInfo.pricePerDay ?? 0).toLocaleString('vi-VN')} = ${(rentalInfo.total ?? 0).toLocaleString('vi-VN')} VND`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Tiền cọc:</strong> {rentalInfo.rentalType === 'month' ? '1 tháng' : '1 ngày'} = {(rentalInfo.depositAmount ?? 0).toLocaleString('vi-VN')} VND
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                <strong>Tổng thanh toán:</strong> {(rentalInfo.totalToPay ?? rentalInfo.total ?? 0).toLocaleString('vi-VN')} VND (tiền phòng + tiền cọc)
              </Typography>
            </Box>
          )}
        </Paper>
      )}
      {extendState && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.selected' }}>
          <Typography variant="subtitle2" color="text.secondary">Gia hạn thuê</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>{extendState.roomTitle}</Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Thời gian:</strong>{' '}
              {extendState.currentEndDate ? new Date(extendState.currentEndDate).toLocaleDateString('vi-VN') : '—'} -{' '}
              {extendState.newEndDate ? new Date(extendState.newEndDate).toLocaleDateString('vi-VN') : '—'}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
              <strong>Tổng thanh toán:</strong>{' '}
              {(extendState.totalToPay ?? 0).toLocaleString('vi-VN')} VND
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
              Chỉ tính tiền thuê theo tháng (không tính cọc thêm).
            </Typography>
          </Box>
        </Paper>
      )}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography sx={{ mb: 1 }}>Số tiền (VND)</Typography>
        <TextField
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Nhập số tiền hoặc chọn từ trang gói"
          type="number"
          fullWidth
          disabled={!!extendState}
        />
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={handleRequest} disabled={loading || !isRentalFlow}>
            Yêu cầu thanh toán
          </Button>
          <Button variant="outlined" onClick={() => { setAmount(''); setResult(null); }}>
            Hủy
          </Button>
        </Box>
      </Paper>

      {result && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }} color='primary.main'>Thông tin chuyển khoản</Typography>
          <Typography>Ngân hàng: {result.bankName}</Typography>
          <Typography>Số tài khoản: {result.bankAccount}</Typography>
          <Typography>Nội dung chuyển khoản: {result.content}</Typography>
          <Typography>Số tiền: {result.amount}</Typography>
          <Typography>Thời gian: {new Date(result.time).toLocaleString()}</Typography>

          <Box sx={{ mt: 2 }}>
            <Typography sx={{ mb: 1, fontWeight: 'bold' }}>Quét mã QR tại đây </Typography>
            {result.vietqrImageUrl ? (
              <img alt="VietQR" src={result.vietqrImageUrl} />
            ) : (
              <img alt="QR" src={`https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(result.vietqrPayload)}`} />
            )}
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" color="secondary" onClick={handleConfirmPaid} disabled={confirmSent}>
                {confirmSent ? 'Đã gửi yêu cầu' : 'Xác nhận đã thanh toán'}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Paying;
