import React from 'react';
import { Typography, TextField, Box } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const today = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const DateRangeFilter = ({
  checkInDate,
  checkOutDate,
  setCheckInDate,
  setCheckOutDate
}) => {
  const handleCheckInChange = (e) => {
    const value = e.target.value;
    setCheckInDate(value || '');
    if (value && checkOutDate && value > checkOutDate) {
      setCheckOutDate(value);
    }
  };

  const handleCheckOutChange = (e) => {
    setCheckOutDate(e.target.value || '');
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <CalendarMonthIcon fontSize="small" />
        Tìm theo khoảng ngày (chỉ hiển thị phòng còn trống)
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <TextField
          label="Từ ngày"
          type="date"
          value={checkInDate}
          onChange={handleCheckInChange}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: today() }}
          fullWidth
          size="small"
        />
        <TextField
          label="Đến ngày"
          type="date"
          value={checkOutDate}
          onChange={handleCheckOutChange}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: checkInDate || today()
          }}
          fullWidth
          size="small"
        />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Chỉ hiển thị phòng chưa có người thuê trong khoảng ngày đã chọn.
      </Typography>
    </Box>
  );
};

export default DateRangeFilter;
