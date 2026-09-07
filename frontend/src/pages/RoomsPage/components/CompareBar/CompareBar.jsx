import React from 'react';
import { Avatar, Box, Button, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { roomKey } from '../../compareSelection';

const CompareBar = ({ rooms, onRemove, onClear, onCompare }) => {
  if (!rooms.length) return null;

  return (
    <Box
      role="region"
      aria-label="Các phòng đang chọn để so sánh"
      sx={{
        position: 'fixed',
        zIndex: 1200,
        bottom: 16,
        left: { xs: 12, md: '50%' },
        right: { xs: 12, md: 'auto' },
        transform: { xs: 'none', md: 'translateX(-50%)' },
        width: { xs: 'auto', md: 'min(680px, calc(100vw - 32px))' },
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: '0 8px 28px rgba(29, 29, 36, 0.18)',
        p: 1.25
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} spacing={1.25}>
        <CompareArrowsIcon color="primary" aria-hidden="true" />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          {rooms.map((room) => (
            <Stack key={roomKey(room)} direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
              <Avatar src={room.image} alt="" variant="rounded" sx={{ width: 34, height: 34 }} />
              <Typography variant="body2" noWrap sx={{ minWidth: 0, flex: 1 }}>{room.title}</Typography>
              <IconButton size="small" aria-label={`Bỏ ${room.title} khỏi so sánh`} onClick={() => onRemove(roomKey(room))}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
          {rooms.length === 1 && <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, alignSelf: 'center' }}>Chọn thêm 1 phòng</Typography>}
        </Stack>
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Button variant="contained" size="small" disabled={rooms.length !== 2} onClick={onCompare} sx={{ flexShrink: 0 }}>
            So sánh
          </Button>
          <Button variant="text" size="small" onClick={onClear} sx={{ flexShrink: 0 }}>
            Xóa tất cả
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default CompareBar;
