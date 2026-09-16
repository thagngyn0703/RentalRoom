import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getMyBookings } from '../../services/api/bookingApi';
import { useSelector } from 'react-redux';
import earlyCheckoutApi from '../../services/api/earlyCheckoutApi';
import checkoutRequestApi from '../../services/api/checkoutRequestApi';
import axiosJWT from '../../config/axiosJWT';

const MyRentals = () => {
  const [currentBookings, setCurrentBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [approvedDeposits, setApprovedDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const currentUser = useSelector((s) => s?.auth?.login?.currentUser);
  const myUserId = currentUser?._id || currentUser?.id;

  // Dialog trả phòng sớm
  const [earlyCheckoutDialog, setEarlyCheckoutDialog] = useState({
    open: false,
    booking: null,
    requestedDate: '',
    reason: '',
    calculating: false,
    preview: null,
    existingRequest: null, // yêu cầu đã gửi (để hiển thị trạng thái + phản hồi admin)
  });

  const [myEarlyCheckoutRequests, setMyEarlyCheckoutRequests] = useState([]);
  const [myCheckoutRequests, setMyCheckoutRequests] = useState([]);

  // Dialog yêu cầu trả phòng (trả phòng bình thường, gửi admin xác nhận)
  const [checkoutDialog, setCheckoutDialog] = useState({
    open: false,
    booking: null,
    note: '',
    existingRequest: null,
    submitting: false,
  });

  // Dialog gia hạn thêm tháng cho booking đang thuê
  const [renewDialog, setRenewDialog] = useState({
    open: false,
    booking: null,
    monthsToAdd: 1,
  });

  useEffect(() => {
    loadBookings();
    loadMyDeposits();
  }, []);

  // Khi chuyển sang tab Phòng đặt cọc thì tải lại danh sách để hiện đặt cọc mới (kể cả chờ duyệt)
  useEffect(() => {
    if (tabValue === 1) loadMyDeposits();
  }, [tabValue]);

  const loadMyDeposits = async () => {
    try {
      const res = await axiosJWT.get('/api/payments/deposits/mine');
      const list = Array.isArray(res.data?.deposits) ? res.data.deposits : (Array.isArray(res.data) ? res.data : []);
      setApprovedDeposits(list);
    } catch (e) {
      console.error('Load my deposits', e);
      setApprovedDeposits([]);
    }
  };

  useEffect(() => {
    const loadMyRequests = async () => {
      try {
        const [earlyRes, checkoutRes] = await Promise.all([
          earlyCheckoutApi.getMyRequests(),
          checkoutRequestApi.getMy(),
        ]);
        setMyEarlyCheckoutRequests(earlyRes?.requests || []);
        setMyCheckoutRequests(checkoutRes?.requests || []);
      } catch (e) {
        console.error('Load my requests', e);
      }
    };
    loadMyRequests();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getMyBookings();
      if (data.success) {
        setCurrentBookings(data.currentBookings || []);
        setPastBookings(data.pastBookings || []);
      } else {
        setError('Không thể tải danh sách thuê phòng');
      }
    } catch (err) {
      console.error('Load bookings error:', err);
      setError('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Tính toán preview tiền hoàn lại
  const calculateRefundPreview = (booking, requestedDateStr) => {
    if (!booking || !requestedDateStr) return null;

    const requestedDate = new Date(requestedDateStr);
    const originalEndDate = new Date(booking.endDate);
    const now = new Date();

    // Giả sử giá phòng theo tháng
    const monthlyPrice = booking.room?.price || 0;
    const dailyPrice = Math.round(monthlyPrice / 30);

    // Số ngày còn lại
    const daysRemaining = Math.max(0, Math.ceil((originalEndDate - requestedDate) / (1000 * 60 * 60 * 24)));

    // Tiền hoàn lại
    const refundAmount = daysRemaining * dailyPrice;

    // Phí phạt nếu thông báo < 30 ngày
    const daysNotice = Math.ceil((requestedDate - now) / (1000 * 60 * 60 * 24));
    const penaltyFee = daysNotice < 30 ? refundAmount * 0.1 : 0;

    // Tiền thực nhận
    const netRefund = Math.max(0, refundAmount - penaltyFee);

    return {
      daysRemaining,
      refundAmount,
      penaltyFee,
      netRefund,
      daysNotice,
    };
  };

  // Mở dialog trả phòng sớm
  const handleOpenEarlyCheckout = (booking) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const bookingId = booking?._id;
    const existingRequest = (myEarlyCheckoutRequests || []).find(
      (r) => (r.booking?._id || r.booking) === bookingId
    );

    setEarlyCheckoutDialog({
      open: true,
      booking,
      requestedDate: tomorrow.toISOString().slice(0, 10),
      reason: '',
      calculating: false,
      preview: null,
      existingRequest: existingRequest || null,
    });
  };

  // Đóng dialog
  const handleCloseEarlyCheckout = () => {
    setEarlyCheckoutDialog({
      open: false,
      booking: null,
      requestedDate: '',
      reason: '',
      calculating: false,
      preview: null,
      existingRequest: null,
    });
  };

  const handleOpenCheckout = (booking) => {
    const bookingId = booking?._id;
    const existingRequest = (myCheckoutRequests || []).find(
      (r) => (r.booking?._id || r.booking) === bookingId
    );
    setCheckoutDialog({
      open: true,
      booking,
      note: '',
      existingRequest: existingRequest || null,
      submitting: false,
    });
  };

  const handleCloseCheckout = () => {
    setCheckoutDialog({ open: false, booking: null, note: '', existingRequest: null, submitting: false });
  };

  const handleOpenRenew = (booking) => {
    setRenewDialog({
      open: true,
      booking,
      monthsToAdd: 1,
    });
  };

  const handleCloseRenew = () => {
    setRenewDialog({ open: false, booking: null, monthsToAdd: 1 });
  };

  const handleSubmitCheckout = async () => {
    if (!checkoutDialog.booking) return;
    try {
      setCheckoutDialog(prev => ({ ...prev, submitting: true }));
      const res = await checkoutRequestApi.create({
        bookingId: checkoutDialog.booking._id,
        note: checkoutDialog.note,
      });
      if (res.success) {
        alert('Yêu cầu trả phòng đã được gửi. Admin sẽ xác nhận và thông báo cho bạn.');
        handleCloseCheckout();
        loadBookings();
        const data = await checkoutRequestApi.getMy();
        setMyCheckoutRequests(data?.requests || []);
      } else {
        alert('Lỗi: ' + (res.message || 'Gửi thất bại'));
      }
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setCheckoutDialog(prev => ({ ...prev, submitting: false }));
    }
  };

  // Cập nhật ngày yêu cầu
  const handleDateChange = (event) => {
    const newDate = event.target.value;
    const preview = calculateRefundPreview(earlyCheckoutDialog.booking, newDate);

    setEarlyCheckoutDialog(prev => ({
      ...prev,
      requestedDate: newDate,
      preview,
    }));
  };

  // Gửi yêu cầu trả phòng sớm
  const handleSubmitEarlyCheckout = async () => {
    if (!earlyCheckoutDialog.booking || !earlyCheckoutDialog.requestedDate) return;

    try {
      setEarlyCheckoutDialog(prev => ({ ...prev, calculating: true }));

      const data = {
        bookingId: earlyCheckoutDialog.booking._id,
        requestedCheckoutDate: earlyCheckoutDialog.requestedDate,
        reason: earlyCheckoutDialog.reason,
      };

      const response = await earlyCheckoutApi.createRequest(data);

      if (response.success) {
        alert('Yêu cầu trả phòng sớm đã được gửi thành công! Bạn có thể xem trạng thái tại đây.');
        handleCloseEarlyCheckout();
        loadBookings();
        const res = await earlyCheckoutApi.getMyRequests();
        setMyEarlyCheckoutRequests(res?.requests || []);
      } else {
        alert('Lỗi: ' + response.message);
      }
    } catch (err) {
      console.error('Submit early checkout error:', err);
      alert('Lỗi khi gửi yêu cầu: ' + (err.response?.data?.message || err.message));
    } finally {
      setEarlyCheckoutDialog(prev => ({ ...prev, calculating: false }));
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const addMonthsToDate = (dateStr, months) => {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const renewPreview = (() => {
    if (!renewDialog.booking) return null;
    const monthsToAdd = Math.max(1, Number(renewDialog.monthsToAdd) || 1);
    const pricePerMonth = Number(renewDialog.booking.room?.price || 0);
    const totalToPay = pricePerMonth * monthsToAdd; // chỉ tính tiền thuê theo tháng (không tính cọc thêm)
    const currentEnd = new Date(renewDialog.booking.endDate);
    const newEndDate = addMonthsToDate(currentEnd, monthsToAdd);
    return { monthsToAdd, pricePerMonth, totalToPay, currentEnd, newEndDate };
  })();

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'pending': return 'Chờ xác nhận';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  // Thanh toán nốt: số tiền còn lại = giá 1 tháng × số tháng ở
  const getDepositPayInfo = (deposit) => {
    const room = deposit.room || {};
    const pricePerMonth = room.price || 0;
    const start = new Date(deposit.startDate);
    const end = new Date(deposit.endDate);
    const days = Math.max(0, Math.ceil((end - start) / (24 * 60 * 60 * 1000)));
    const months = Math.max(1, Math.ceil(days / 30));
    const totalRent = pricePerMonth * months; // số tiền còn lại = tiền 1 tháng × số tháng
    const depositPaid = deposit.amount || 0;
    const remaining = totalRent;
    return { months, pricePerMonth, totalRent, depositPaid, remaining };
  };

  const getRoomOwnerId = (room) => {
    if (!room) return '';
    const owner = room.user;
    if (!owner) return '';
    if (typeof owner === 'string') return owner;
    return owner?._id || owner?.id || '';
  };

  const DepositCard = ({ deposit }) => {
    const room = deposit.room || {};
    const isApproved = deposit.status === 'approved';
    const { months, pricePerMonth, totalRent, depositPaid, remaining } = getDepositPayInfo(deposit);
    const handlePayRemaining = () => {
      navigate(`/user/paying/${remaining}`, {
        state: {
          fromDeposit: true,
          depositId: deposit._id,
          roomId: room._id,
          startDate: deposit.startDate,
          endDate: deposit.endDate,
          roomTitle: room.title || room.address || 'Phòng trọ',
          months,
          pricePerMonth,
          totalRent,
          depositPaid,
          remaining,
        },
      });
    };
    return (
      <Card sx={{ mb: 2, display: 'flex' }}>
        <CardMedia
          component="img"
          sx={{ width: 200, height: 150, objectFit: 'cover' }}
          image={room.images?.[0] || '/logo512.png'}
          alt={room.title || 'Phòng trọ'}
        />
        <CardContent sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="div">
              {room.title || room.address || 'Phòng trọ'}
            </Typography>
            <Chip
              label={isApproved ? 'Đã xác nhận đặt cọc' : 'Chờ xác nhận đặt cọc'}
              color={isApproved ? 'success' : 'warning'}
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Địa chỉ: {room.address || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Thời gian thuê: {formatDate(deposit.startDate)} - {formatDate(deposit.endDate)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Đã cọc: {(deposit.amount || 0).toLocaleString('vi-VN')} đ
          </Typography>
          {isApproved ? (
            <>
              <Typography variant="body2" sx={{ mb: 2 }} color="primary">
                Còn thanh toán: {remaining.toLocaleString('vi-VN')} đ
              </Typography>
              <Button size="small" variant="contained" onClick={handlePayRemaining}>
                Thanh toán nốt
              </Button>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Chờ admin xác nhận đặt cọc. Sau khi được duyệt, bạn có thể thanh toán nốt tiền thuê.
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  const BookingCard = ({ booking, isCurrent }) => (
    <Card sx={{ mb: 2, display: 'flex' }}>
      <CardMedia
        component="img"
        sx={{ width: 200, height: 150, objectFit: 'cover' }}
        image={booking.room?.images?.[0] || '/logo512.png'}
        alt={booking.room?.title || 'Phòng trọ'}
      />
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div">
            {booking.room?.title || booking.room?.address || 'Phòng trọ'}
          </Typography>
          <Chip
            label={getStatusText(booking.status)}
            color={getStatusColor(booking.status)}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Địa chỉ: {booking.room?.address || 'N/A'}
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          Thời gian: {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
        </Typography>

        <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
          Giá: {booking.room?.price?.toLocaleString('vi-VN')} đ/tháng
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate(`/user/my-rentals/booking/${booking._id}`)}
          >
            Xem chi tiết
          </Button>
          {isCurrent && booking.status === 'confirmed' && (
            <>
              <Button
                size="small"
                variant="contained"
                color="secondary"
                onClick={() => {
                  const roomId = booking.room?._id || booking.room?.id;
                  const ownerId = getRoomOwnerId(booking.room);
                  if (!roomId || !ownerId) {
                    alert('Không xác định được chủ phòng để bắt đầu trò chuyện.');
                    return;
                  }
                  if (String(ownerId) === String(myUserId)) {
                    alert('Bạn không thể nhắn tin với chính mình.');
                    return;
                  }
                  navigate(
                    `/user/chat?roomId=${encodeURIComponent(String(roomId))}&ownerId=${encodeURIComponent(String(ownerId))}`
                  );
                }}
              >
                Liên hệ chủ nhà
              </Button>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => handleOpenRenew(booking)}
                sx={{
                  fontWeight: 800,
                  boxShadow: '0 6px 16px rgba(8, 127, 114, 0.25)',
                  '&:hover': { boxShadow: '0 10px 24px rgba(8, 127, 114, 0.35)' },
                }}
              >
                Gia hạn thêm tháng
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => handleOpenCheckout(booking)}
              >
                Trả phòng
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="warning"
                onClick={() => handleOpenEarlyCheckout(booking)}
              >
                Trả phòng sớm
              </Button>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={loadBookings}>
          Thử lại
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h4" sx={{ textAlign: 'center', flex: 1 }}>
          Phòng Đã Thuê
        </Typography>
        <Button variant="outlined" size="small" onClick={() => { loadBookings(); loadMyDeposits(); }} disabled={loading}>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </Button>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label={`Đang thuê (${currentBookings.length})`} />
          <Tab label={`Phòng đặt cọc (${approvedDeposits.length})`} />
          <Tab label={`Đã thuê (${pastBookings.length})`} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Box>
              {currentBookings.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Bạn chưa thuê phòng nào đang hoạt động.
                </Typography>
              ) : (
                currentBookings.map((booking) => (
                  <BookingCard key={booking._id} booking={booking} isCurrent={true} />
                ))
              )}
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              {approvedDeposits.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Bạn chưa có đặt cọc nào. Đặt cọc tại trang thuê phòng, sau khi admin xác nhận sẽ hiện tại đây và bạn có thể thanh toán nốt.
                </Typography>
              ) : (
                approvedDeposits.map((d) => <DepositCard key={d._id} deposit={d} />)
              )}
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              {pastBookings.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Bạn chưa có lịch sử thuê phòng.
                </Typography>
              ) : (
                pastBookings.map((booking) => (
                  <BookingCard key={booking._id} booking={booking} isCurrent={false} />
                ))
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Dialog Trả phòng sớm */}
      <Dialog open={earlyCheckoutDialog.open} onClose={handleCloseEarlyCheckout} maxWidth="md" fullWidth>
        <DialogTitle>Trả phòng sớm</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Phòng: {earlyCheckoutDialog.booking?.room
              ? (earlyCheckoutDialog.booking.room.roomType || earlyCheckoutDialog.booking.room.address || 'N/A')
              : 'N/A'}
          </Typography>

          {earlyCheckoutDialog.existingRequest ? (
            <Box sx={{ py: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Trạng thái yêu cầu</Typography>
              <Chip
                label={earlyCheckoutDialog.existingRequest.status === 'pending' ? 'Chờ xử lý' : earlyCheckoutDialog.existingRequest.status === 'approved' ? 'Đã phê duyệt' : 'Đã từ chối'}
                color={earlyCheckoutDialog.existingRequest.status === 'pending' ? 'warning' : earlyCheckoutDialog.existingRequest.status === 'approved' ? 'success' : 'error'}
                size="small"
                sx={{ mt: 1 }}
              />
              {earlyCheckoutDialog.existingRequest.reason && (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Lý do bạn gửi:</strong> {earlyCheckoutDialog.existingRequest.reason}
                </Typography>
              )}
              {earlyCheckoutDialog.existingRequest.adminNote && (
                <Typography variant="body2" sx={{ mt: 2 }} color="primary">
                  <strong>Phản hồi từ admin:</strong> {earlyCheckoutDialog.existingRequest.adminNote}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {earlyCheckoutDialog.existingRequest.status === 'pending' && 'Admin sẽ xem xét và phản hồi bạn sớm.'}
                {earlyCheckoutDialog.existingRequest.status === 'approved' && 'Tiền hoàn lại đã được chuyển vào ví của bạn.'}
                {earlyCheckoutDialog.existingRequest.status === 'rejected' && 'Yêu cầu đã bị từ chối. Nếu cần hỗ trợ, vui lòng liên hệ admin.'}
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ngày muốn trả phòng"
                    type="date"
                    value={earlyCheckoutDialog.requestedDate}
                    onChange={handleDateChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                      max: earlyCheckoutDialog.booking ? new Date(earlyCheckoutDialog.booking.endDate).toISOString().slice(0, 10) : undefined,
                    }}
                  />
                </Grid>
              </Grid>
              <TextField
                fullWidth
                label="Lý do trả phòng sớm (ghi rõ)"
                placeholder="Ví dụ: Chuyển công tác, việc cá nhân..."
                multiline
                rows={3}
                value={earlyCheckoutDialog.reason}
                onChange={(e) => setEarlyCheckoutDialog(prev => ({ ...prev, reason: e.target.value }))}
                sx={{ mt: 2 }}
              />

              {earlyCheckoutDialog.preview && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Tiền hoàn lại dự kiến:</Typography>
                  <Typography>Số ngày còn lại: {earlyCheckoutDialog.preview.daysRemaining} ngày</Typography>
                  <Typography>Tiền hoàn lại: {earlyCheckoutDialog.preview.refundAmount.toLocaleString('vi-VN')} đ</Typography>
                  <Typography>Phí phạt: {earlyCheckoutDialog.preview.penaltyFee.toLocaleString('vi-VN')} đ</Typography>
                  <Typography variant="h6" color="primary">
                    Tiền thực nhận: {earlyCheckoutDialog.preview.netRefund.toLocaleString('vi-VN')} đ
                  </Typography>
                  {earlyCheckoutDialog.preview.daysNotice < 30 && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      * Phí phạt 10% vì thông báo trước dưới 30 ngày
                    </Typography>
                  )}
                </Box>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                * Yêu cầu sẽ được admin xem xét và phê duyệt. Bạn có thể xem trạng thái ngay tại đây sau khi gửi.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEarlyCheckout}>Hủy</Button>
          {!earlyCheckoutDialog.existingRequest && (
            <Button
              onClick={handleSubmitEarlyCheckout}
              variant="contained"
              disabled={earlyCheckoutDialog.calculating || !earlyCheckoutDialog.requestedDate}
            >
              {earlyCheckoutDialog.calculating ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog Yêu cầu trả phòng (gửi admin xác nhận) */}
      <Dialog open={checkoutDialog.open} onClose={handleCloseCheckout} maxWidth="sm" fullWidth>
        <DialogTitle>Yêu cầu trả phòng</DialogTitle>
        <DialogContent>
          {checkoutDialog.booking && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              Phòng: {checkoutDialog.booking.room?.roomType || checkoutDialog.booking.room?.address || 'N/A'}
            </Typography>
          )}
          {checkoutDialog.existingRequest ? (
            <Box sx={{ py: 1 }}>
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Thời hạn</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Ngày hết hạn thuê:</strong>{' '}
                  {formatDate(checkoutDialog.booking?.endDate || checkoutDialog.existingRequest?.booking?.endDate)}
                </Typography>
                {checkoutDialog.existingRequest.status === 'confirmed' && checkoutDialog.existingRequest.confirmedAt && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>Ngày trả phòng:</strong>{' '}
                    {formatDate(checkoutDialog.existingRequest.confirmedAt)}
                  </Typography>
                )}
              </Box>
              {(() => {
                const booking = checkoutDialog.booking || checkoutDialog.existingRequest?.booking;
                const deposit = Number(booking?.depositAmount ?? booking?.room?.price ?? 0);
                const lateFee = Number(checkoutDialog.existingRequest?.lateFeeAmount ?? 0);
                const refund = Math.max(0, deposit - lateFee);
                return (
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">Tiền cọc &amp; hoàn trả</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      <strong>Tiền cọc phòng:</strong> {deposit.toLocaleString('vi-VN')} đ
                    </Typography>
                    {checkoutDialog.existingRequest.status === 'confirmed' ? (
                      <>
                        {lateFee > 0 && (
                          <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>
                            <strong>Số tiền phải đóng thêm (phí trả trễ {checkoutDialog.existingRequest.lateFeeDays} ngày):</strong>{' '}
                            {lateFee.toLocaleString('vi-VN')} đ
                          </Typography>
                        )}
                        <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>
                          Số tiền bạn nhận lại sau khi trả phòng: {refund.toLocaleString('vi-VN')} đ
                          {lateFee > 0 ? ' (tiền cọc − phí trả trễ)' : ' (full tiền cọc)'}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                          Admin đã xác nhận và chuyển vào ví của bạn.
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {checkoutDialog.existingRequest.status === 'pending_owner' && 'Đang chờ chủ trọ xác nhận yêu cầu trả phòng.'}
                        {checkoutDialog.existingRequest.status === 'pending_admin' && 'Chủ trọ đã xác nhận. Đang chờ admin xác nhận và hoàn tiền cọc vào ví bạn.'}
                        {checkoutDialog.existingRequest.status === 'rejected_owner' && 'Chủ trọ đã từ chối yêu cầu trả phòng của bạn.'}
                      </Typography>
                    )}
                  </Box>
                );
              })()}
              <Typography variant="subtitle2" color="text.secondary">Trạng thái yêu cầu</Typography>
              <Chip
                label={
                  checkoutDialog.existingRequest.status === 'pending_owner'
                    ? 'Chờ chủ trọ xác nhận'
                    : checkoutDialog.existingRequest.status === 'pending_admin'
                      ? 'Chờ admin xác nhận'
                      : checkoutDialog.existingRequest.status === 'rejected_owner'
                        ? 'Chủ trọ đã từ chối'
                        : 'Đã xác nhận trả phòng'
                }
                color={
                  checkoutDialog.existingRequest.status === 'rejected_owner'
                    ? 'error'
                    : checkoutDialog.existingRequest.status === 'confirmed'
                      ? 'success'
                      : 'warning'
                }
                size="small"
                sx={{ mt: 1 }}
              />
              {checkoutDialog.existingRequest.note && (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Ghi chú của bạn:</strong> {checkoutDialog.existingRequest.note}
                </Typography>
              )}
              {checkoutDialog.existingRequest.ownerNote && (
                <Typography variant="body2" sx={{ mt: 2 }} color="primary">
                  <strong>Phản hồi chủ trọ:</strong> {checkoutDialog.existingRequest.ownerNote}
                </Typography>
              )}
            </Box>
          ) : (
            <>
              <TextField
                fullWidth
                label="Ghi chú (tùy chọn)"
                placeholder="Ví dụ: Đã bàn giao chìa khóa..."
                multiline
                rows={3}
                value={checkoutDialog.note}
                onChange={(e) => setCheckoutDialog(prev => ({ ...prev, note: e.target.value }))}
                sx={{ mt: 1 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                * Yêu cầu sẽ gửi tới chủ trọ xác nhận trước, sau đó admin mới xác nhận và hoàn tiền cọc vào ví bạn (nếu trả quá hạn sẽ trừ phí trả trễ: quá 1 ngày thì mỗi ngày = giá phòng ÷ 30).
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCheckout}>Đóng</Button>
          {!checkoutDialog.existingRequest && (
            <Button
              onClick={handleSubmitCheckout}
              variant="contained"
              disabled={checkoutDialog.submitting}
            >
              {checkoutDialog.submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog Gia hạn thêm tháng (gửi yêu cầu gia hạn tới chủ trọ) */}
      <Dialog open={renewDialog.open} onClose={handleCloseRenew} maxWidth="sm" fullWidth>
        <DialogTitle>Gia hạn thuê phòng</DialogTitle>
        <DialogContent>
          {renewDialog.booking ? (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Phòng: {renewDialog.booking.room?.roomType || renewDialog.booking.room?.address || 'N/A'}
              </Typography>

              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Thời gian hiện tại:</strong>{' '}
                  {formatDate(renewDialog.booking.startDate)} - {formatDate(renewDialog.booking.endDate)}
                </Typography>
                {renewPreview && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>Dự kiến hết hạn sau gia hạn:</strong> {formatDate(renewPreview.newEndDate)}
                  </Typography>
                )}
              </Box>

              <TextField
                fullWidth
                label="Số tháng gia hạn"
                type="number"
                value={renewDialog.monthsToAdd}
                onChange={(e) => {
                  const n = Math.max(1, Number(e.target.value) || 1);
                  setRenewDialog((p) => ({ ...p, monthsToAdd: n }));
                }}
                inputProps={{ min: 1, max: 24 }}
              />

              {renewPreview && (
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    bgcolor: 'info.light',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'info.main',
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">Tổng thanh toán</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'info.main' }}>
                    {renewPreview.totalToPay.toLocaleString('vi-VN')} VND
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                    Chỉ tính tiền thuê theo tháng (không tính cọc thêm).
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <Typography color="text.secondary">Không có dữ liệu.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRenew}>Hủy</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!renewDialog.booking || !(renewPreview && renewPreview.totalToPay > 0)}
            onClick={() => {
              if (!renewPreview || !renewDialog.booking) return;
              const b = renewDialog.booking;
              navigate('/user/paying', {
                state: {
                  fromExtend: true,
                  bookingId: b._id,
                  roomId: b.room?._id || b.room?.id,
                  roomTitle: b.room?.title || b.room?.address || 'Phòng trọ',
                  currentEndDate: b.endDate,
                  newEndDate: renewPreview.newEndDate.toISOString(),
                  monthsToAdd: renewPreview.monthsToAdd,
                  pricePerMonth: renewPreview.pricePerMonth,
                  totalToPay: renewPreview.totalToPay,
                },
              });
            }}
          >
            Thanh toán
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyRentals;