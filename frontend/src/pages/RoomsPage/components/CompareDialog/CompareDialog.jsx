import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery } from '@mui/material';
import { roomKey } from '../../compareSelection';

export const formatValue = (value, fallback = 'Chưa cập nhật') => {
  if (value === undefined || value === null || value === '') return fallback;
  if (Array.isArray(value)) {
    if (!value.length) return fallback;
    return value.map((item) => (typeof item === 'object' ? [item.type, item.frequency].filter(Boolean).join(' · ') : item)).join(', ');
  }
  return String(value);
};

const rows = [
  ['Giá thuê', (room) => `${formatValue(room.price, '0')} VND/tháng`],
  ['Diện tích', (room) => `${formatValue(room.area, '0')} m²`],
  ['Địa chỉ', (room) => [room.address, room.ward, room.district, room.city].filter(Boolean).join(', ') || 'Chưa cập nhật'],
  ['Loại phòng', (room) => formatValue(room.roomType || room.type)],
  ['Phòng ngủ', (room) => formatValue(room.beds, '0')],
  ['Phòng tắm', (room) => formatValue(room.baths, '0')],
  ['Đánh giá', (room) => `${formatValue(room.rating, '0')} (${formatValue(room.totalRatings, '0')} lượt)`],
  ['Tiện ích', (room) => formatValue(room.utilities || room.features)],
  ['Chi phí phát sinh', (room) => formatValue(room.additionalCosts || room.costs)],
  ['Trạng thái', (room) => formatValue(room.status || room.availability)]
];

const CompareDialog = ({ open, rooms, onClose, onViewDetails }) => {
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
  <Dialog open={open} onClose={onClose} fullScreen={isMobile} fullWidth maxWidth="md" aria-labelledby="compare-dialog-title">
    <DialogTitle id="compare-dialog-title">So sánh 2 phòng</DialogTitle>
    <DialogContent dividers>
      {rooms.length === 2 ? (
        isMobile ? (
          <Stack spacing={2}>
            {rooms.map((room) => (
              <Box key={roomKey(room)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <Box component="img" src={room.image} alt={room.title} sx={{ display: 'block', width: '100%', height: 180, objectFit: 'cover' }} />
                <Typography variant="h6" sx={{ p: 2, pb: 1, fontWeight: 700 }}>{room.title}</Typography>
                <Stack divider={<Box component="span" sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
                  {rows.map(([label, getValue]) => (
                    <Stack key={`${roomKey(room)}-${label}`} direction="row" justifyContent="space-between" spacing={2} sx={{ px: 2, py: 1.25 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>{label}</Typography>
                      <Typography variant="body2" textAlign="right">{getValue(room)}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 560 }} aria-label="Bảng so sánh phòng">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '24%', fontWeight: 700 }}>Tiêu chí</TableCell>
                {rooms.map((room) => (
                  <TableCell key={roomKey(room)} sx={{ minWidth: 230 }}>
                    <Stack spacing={1}>
                      <Box component="img" src={room.image} alt={room.title} sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 1.5 }} />
                      <Typography variant="subtitle1" fontWeight={700}>{room.title}</Typography>
                    </Stack>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(([label, getValue]) => (
                <TableRow key={label}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600, color: 'text.secondary' }}>{label}</TableCell>
                  {rooms.map((room) => <TableCell key={`${roomKey(room)}-${label}`}>{getValue(room)}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        )
      ) : (
        <Typography color="text.secondary">Chọn đủ 2 phòng để xem so sánh.</Typography>
      )}
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
      <Button onClick={onClose}>Đóng</Button>
      <Stack direction="row" spacing={1}>
        {rooms.map((room) => <Button key={roomKey(room)} onClick={() => onViewDetails(roomKey(room))}>Xem {room.title}</Button>)}
      </Stack>
    </DialogActions>
  </Dialog>
  );
};

export default CompareDialog;
