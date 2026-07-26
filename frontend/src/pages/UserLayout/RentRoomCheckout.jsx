import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Checkbox,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRoomById } from '../../services/api/postApi';
import { checkAvailability } from '../../services/api/bookingApi';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const PRICE_PER_DAY_FROM_MONTH = 30; // 1 tháng = 30 ngày để tính giá/ngày

const formatDateForInput = (d) => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
};

const getDaysBetween = (fromStr, toStr) => {
  if (!fromStr || !toStr) return 0;
  const from = new Date(fromStr);
  const to = new Date(toStr);
  if (to < from) return 0;
  return Math.floor((to - from) / 86400000) + 1; // inclusive
};

const getMonthEndDate = (startStr, months) => {
  if (!startStr || !months || months < 1) return '';
  const d = new Date(startStr);
  d.setMonth(d.getMonth() + months);
  d.setDate(d.getDate() - 1);
  return formatDateForInput(d);
};

const RentRoomCheckout = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rentalType, setRentalType] = useState('month'); // 'day' | 'month'
  const [quantity, setQuantity] = useState(1); // số tháng khi thuê theo tháng
  const [dateFrom, setDateFrom] = useState(() => formatDateForInput(new Date()));
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDateForInput(d);
  });
  const [monthStartDate, setMonthStartDate] = useState(() => formatDateForInput(new Date()));
  const [availability, setAvailability] = useState({ status: 'idle', available: null, message: null }); // idle | loading | done
  const [error, setError] = useState(null);
  const [contractOpen, setContractOpen] = useState(false);
  const [contractAction, setContractAction] = useState(null); // 'payment' | 'deposit'
  const [contractAgreed, setContractAgreed] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!roomId) {
        setError('Thiếu thông tin phòng');
        setLoading(false);
        return;
      }
      try {
        const data = await fetchRoomById(roomId);
        setRoom(data);
        if (!data) setError('Không tìm thấy phòng');
      } catch (e) {
        setError('Lỗi tải thông tin phòng');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [roomId]);

  const effectiveStartDate = rentalType === 'day' ? dateFrom : monthStartDate;
  const effectiveEndDate = rentalType === 'day' ? dateTo : getMonthEndDate(monthStartDate, Math.max(1, Math.floor(Number(quantity) || 0)));

  useEffect(() => {
    if (!roomId || !effectiveStartDate || !effectiveEndDate) {
      setAvailability({ status: 'idle', available: null, message: null });
      return;
    }
    let cancelled = false;
    setAvailability((a) => ({ ...a, status: 'loading' }));
    checkAvailability({ roomId, startDate: effectiveStartDate, endDate: effectiveEndDate })
      .then((data) => {
        if (!cancelled) setAvailability({ status: 'done', available: data.available, message: data.message || null });
      })
      .catch((err) => {
        if (!cancelled) setAvailability({ status: 'done', available: false, message: err?.response?.data?.message || 'Không thể kiểm tra lịch phòng' });
      });
    return () => { cancelled = true; };
  }, [roomId, effectiveStartDate, effectiveEndDate]);

  const pricePerMonth = Number(room?.price) || 0;
  const pricePerDay = pricePerMonth > 0 ? Math.round(pricePerMonth / PRICE_PER_DAY_FROM_MONTH) : 0;

  const daysCount = rentalType === 'day' ? getDaysBetween(dateFrom, dateTo) : 0;
  const total =
    rentalType === 'month'
      ? pricePerMonth * Math.max(1, Math.floor(Number(quantity) || 0))
      : pricePerDay * Math.max(0, daysCount);

  // Tiền cọc: thuê theo tháng = 1 tháng, thuê theo ngày = 1 ngày (như thuê trọ offline)
  const depositAmount = rentalType === 'month' ? pricePerMonth : pricePerDay;
  const totalToPay = total + depositAmount; // Tổng = tiền phòng + tiền cọc

  const doPayment = () => {
    const payload = {
      fromRental: true,
      roomId,
      roomTitle: room?.title || room?.address,
      rentalType,
      total,
      depositAmount,
      totalToPay,
      pricePerMonth,
      pricePerDay,
      startDate: effectiveStartDate,
      endDate: effectiveEndDate,
    };
    if (rentalType === 'month') {
      payload.quantity = Math.max(1, Math.floor(Number(quantity) || 0));
    } else {
      payload.dateFrom = dateFrom;
      payload.dateTo = dateTo;
      payload.quantity = daysCount;
    }
    navigate(`/user/paying/${totalToPay}`, { state: payload });
  };

  const doDeposit = () => {
    const payload = {
      fromRental: true,
      isDeposit: true,
      roomId,
      roomTitle: room?.title || room?.address,
      rentalType,
      total: depositAmount,
      depositAmount,
      startDate: effectiveStartDate,
      endDate: effectiveEndDate,
    };
    if (rentalType === 'month') {
      payload.quantity = Math.max(1, Math.floor(Number(quantity) || 0));
    } else {
      payload.dateFrom = dateFrom;
      payload.dateTo = dateTo;
      payload.quantity = daysCount;
    }
    navigate(`/user/paying/${depositAmount}`, { state: payload });
  };

  const handlePayment = () => {
    if (total <= 0 || availability.available === false) return;
    setContractAction('payment');
    setContractAgreed(false);
    setContractOpen(true);
  };

  const handleDeposit = () => {
    if (depositAmount <= 0 || availability.available === false) return;
    setContractAction('deposit');
    setContractAgreed(false);
    setContractOpen(true);
  };

  const handleContractClose = () => {
    setContractOpen(false);
    setContractAction(null);
    setContractAgreed(false);
  };

  const handleContractConfirm = () => {
    if (!contractAgreed) return;
    if (contractAction === 'payment') {
      handleContractClose();
      doPayment();
    } else if (contractAction === 'deposit') {
      handleContractClose();
      doDeposit();
    }
  };

  const contractContent = (
    <>
      <DialogContentText component="div" sx={{ maxHeight: 360, overflow: 'auto' }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>HỢP ĐỒNG THUÊ PHÒNG</Typography>
        <Typography variant="body2" paragraph>
          <strong>Bên cho thuê</strong> (Chủ phòng) và <strong>Bên thuê</strong> (Khách thuê) thỏa thuận như sau:
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Điều 1. Đối tượng và thời hạn thuê</strong><br />
          – Phòng: {room?.title || room?.address || '—'}.<br />
          – Địa chỉ: {room?.address || '—'}.<br />
          – Thời gian: từ {effectiveStartDate} đến {effectiveEndDate}.<br />
          – Hình thức: {rentalType === 'month' ? `Thuê theo tháng (${quantity} tháng)` : `Thuê theo ngày (${daysCount} ngày)`}.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Điều 2. Giá thuê và thanh toán</strong><br />
          – Tiền phòng: {rentalType === 'month' ? `${quantity} tháng × ${pricePerMonth.toLocaleString('vi-VN')} = ${total.toLocaleString('vi-VN')}` : `${daysCount} ngày × ${pricePerDay.toLocaleString('vi-VN')} = ${total.toLocaleString('vi-VN')}`} VND.<br />
          – Tiền cọc: {rentalType === 'month' ? '1 tháng' : '1 ngày'} = {depositAmount.toLocaleString('vi-VN')} VND.<br />
          – Tổng thanh toán: {totalToPay.toLocaleString('vi-VN')} VND (tiền phòng + tiền cọc).
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Điều 3. Quyền và nghĩa vụ</strong><br />
          Bên thuê có trách nhiệm giữ gìn tài sản, thanh toán đúng hạn, tuân thủ nội quy. Bên cho thuê bàn giao phòng đúng hạn và đảm bảo chất lượng.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Điều 4. Chấm dứt hợp đồng</strong><br />
          Hai bên thống nhất chấm dứt theo thỏa thuận hoặc theo quy định pháp luật. Tiền cọc được hoàn trả sau khi kiểm tra phòng (trừ phí phạt nếu có).
        </Typography>
      </DialogContentText>
      <FormControlLabel
        control={<Checkbox checked={contractAgreed} onChange={(e) => setContractAgreed(e.target.checked)} />}
        label="Tôi đã đọc và đồng ý với nội dung hợp đồng thuê phòng trên"
        sx={{ mt: 1, display: 'block' }}
      />
    </>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !room) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error || 'Không tìm thấy phòng'}</Alert>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Thuê phòng
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Phòng
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {room.title || room.address || `Phòng ${roomId}`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {room.address}
        </Typography>
        <Typography variant="body1" sx={{ mt: 0.5 }}>
          Giá: {room.price?.toLocaleString('vi-VN')} {room.unit || 'VND'}/tháng
        </Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
          Chọn hình thức thuê
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            row
            value={rentalType}
            onChange={(e) => {
              setRentalType(e.target.value);
              setQuantity(1);
              if (e.target.value === 'day') {
                setDateFrom(formatDateForInput(new Date()));
                const d = new Date();
                d.setDate(d.getDate() + 1);
                setDateTo(formatDateForInput(d));
              }
            }}
          >
            <FormControlLabel
              value="month"
              control={<Radio />}
              label={
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <EventIcon fontSize="small" />
                  <span>Thuê theo tháng</span>
                </Stack>
              }
            />
            <FormControlLabel
              value="day"
              control={<Radio />}
              label={
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <CalendarMonthIcon fontSize="small" />
                  <span>Thuê theo ngày</span>
                </Stack>
              }
            />
          </RadioGroup>
        </FormControl>

        {rentalType === 'month' && (
          <>
            <TextField
              label="Ngày bắt đầu"
              type="date"
              value={monthStartDate}
              onChange={(e) => setMonthStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: formatDateForInput(new Date()) }}
              fullWidth
              sx={{ mt: 1.5 }}
            />
            <TextField
              label="Số tháng"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              inputProps={{ min: 1 }}
              fullWidth
              sx={{ mt: 1.5 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Đến ngày: {effectiveEndDate || '—'}
            </Typography>
          </>
        )}

        {rentalType === 'day' && (
          <Stack spacing={1.5} sx={{ mt: 1.5 }}>
            <TextField
              label="Từ ngày"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                if (e.target.value && dateTo && e.target.value > dateTo) setDateTo(e.target.value);
              }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: formatDateForInput(new Date()) }}
              fullWidth
            />
            <TextField
              label="Đến ngày"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: dateFrom || formatDateForInput(new Date()) }}
              fullWidth
            />
            <Typography variant="body2" color="text.secondary">
              Số ngày thuê: <strong>{daysCount}</strong> ngày
              {daysCount > 0 && (
                <> — {pricePerDay.toLocaleString('vi-VN')} VND/ngày (ước tính từ giá/tháng)</>
              )}
            </Typography>
          </Stack>
        )}
      </Paper>

      {availability.status === 'done' && availability.available === false && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {availability.message || 'Phòng đã được thuê trong khoảng thời gian này. Vui lòng chọn ngày khác.'}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Thanh toán (đã bao gồm tiền cọc)
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95 }}>
          Tiền phòng: {rentalType === 'month'
            ? `${quantity} tháng × ${pricePerMonth.toLocaleString('vi-VN')} = ${total.toLocaleString('vi-VN')} VND`
            : `${daysCount} ngày × ${pricePerDay.toLocaleString('vi-VN')} = ${total.toLocaleString('vi-VN')} VND`}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95 }}>
          Tiền cọc: {rentalType === 'month' ? '1 tháng' : '1 ngày'} = {depositAmount.toLocaleString('vi-VN')} VND
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5, pt: 1, borderTop: '1px solid rgba(255,255,255,0.3)' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Tổng thanh toán
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {totalToPay.toLocaleString('vi-VN')} VND
          </Typography>
        </Stack>
      </Paper>

      <Stack direction="row" spacing={1.5} flexWrap="wrap">
        <Button
          variant="contained"
          color="primary"
          startIcon={<PaymentIcon />}
          onClick={handlePayment}
          disabled={totalToPay <= 0 || availability.available === false || availability.status === 'loading'}
          sx={{ flex: 1, minWidth: 120, py: 1.5, textTransform: 'none', fontWeight: 600 }}
        >
          {availability.status === 'loading' ? 'Đang kiểm tra...' : 'Thanh toán'}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AccountBalanceIcon />}
          onClick={handleDeposit}
          disabled={depositAmount <= 0 || availability.available === false || availability.status === 'loading'}
          sx={{ flex: 1, minWidth: 120, py: 1.5, textTransform: 'none', fontWeight: 600 }}
        >
          {`Đặt cọc ${rentalType === 'month' ? '(1 tháng)' : '(1 ngày)'} (${(depositAmount || 0).toLocaleString('vi-VN')} đ)`}
        </Button>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ textTransform: 'none' }}>
          Quay lại
        </Button>
      </Stack>

      <Dialog open={contractOpen} onClose={handleContractClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {contractAction === 'payment' ? 'Hợp đồng thuê phòng – Thanh toán' : 'Hợp đồng thuê phòng – Đặt cọc'}
        </DialogTitle>
        <DialogContent>{contractContent}</DialogContent>
        <DialogActions>
          <Button onClick={handleContractClose} sx={{ textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleContractConfirm}
            disabled={!contractAgreed}
            sx={{ textTransform: 'none' }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RentRoomCheckout;
