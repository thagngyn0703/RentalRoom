import React from 'react';
import { Box, Typography, Stack, Chip, Avatar, Rating } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';

const RoomInfo = ({ room }) => {
  // Format price with dots as thousand separators
  const formatPrice = (price) => {
    if (!price) return '0';
    // Remove non-numeric characters
    const numericPrice = String(price).replace(/[^\d]/g, '');
    // Add dots every 3 digits from right
    return numericPrice.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        height: '100%',
        pl: { xs: 0, sm: 2 },
        minWidth: 0
      }}
    >
      {/* Author - Moved to top like Facebook/Instagram post */}
      <Stack 
        direction="row" 
        spacing={1.5} 
        alignItems="center"
        sx={{ mb: 0.5 }}
      >
        <Avatar
          src={room.authorAvatar}
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            fontSize: 16,
            fontWeight: 600
          }}
        >
          {room.author?.charAt(0).toUpperCase() || 'N'}
        </Avatar>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>
            {room.author}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
            Người cho thuê
          </Typography>
        </Box>
      </Stack>

      {/* Title */}
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 600, 
          fontSize: { xs: 16, md: 17 },
          lineHeight: 1.4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}
      >
        {room.title}
      </Typography>

      {/* Price */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            color: '#d32f2f',
            fontSize: { xs: 16, md: 17 }
          }}
        >
          {formatPrice(room.price)} VND/tháng
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Rating 
            value={room.rating || 0} 
            precision={0.5} 
            size="small" 
            readOnly
            sx={{
              '& .MuiRating-iconFilled': {
                color: '#ffa500'
              },
              '& .MuiRating-iconEmpty': {
                color: 'rgba(0, 0, 0, 0.12)'
              }
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13, ml: 0.5 }}>
            {room.rating || 0}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
            ({room.totalRatings || 0})
          </Typography>
        </Stack>
      </Box>

      {/* Details - Softer styling */}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.8 }}>
        <Chip
          icon={<AspectRatioIcon sx={{ fontSize: 15, opacity: 0.8 }} />}
          label={`${room.area} m²`}
          size="small"
          sx={{ 
            height: 28,
            bgcolor: 'rgba(0, 177, 79, 0.08)',
            border: 'none',
            fontWeight: 500,
            color: 'text.primary',
            '& .MuiChip-label': { px: 1.2, fontSize: 12.5 },
            '& .MuiChip-icon': { ml: 0.8, color: '#00b14f' }
          }}
        />
        <Chip
          icon={<BedIcon sx={{ fontSize: 15, opacity: 0.8 }} />}
          label={`${room.beds || 0} PN`}
          size="small"
          sx={{ 
            height: 28,
            bgcolor: 'rgba(25, 118, 210, 0.08)',
            border: 'none',
            fontWeight: 500,
            color: 'text.primary',
            '& .MuiChip-label': { px: 1.2, fontSize: 12.5 },
            '& .MuiChip-icon': { ml: 0.8, color: '#1976d2' }
          }}
        />
        <Chip
          icon={<BathtubIcon sx={{ fontSize: 15, opacity: 0.8 }} />}
          label={`${room.baths || 0} WC`}
          size="small"
          sx={{ 
            height: 28,
            bgcolor: 'rgba(211, 47, 47, 0.08)',
            border: 'none',
            fontWeight: 500,
            color: 'text.primary',
            '& .MuiChip-label': { px: 1.2, fontSize: 12.5 },
            '& .MuiChip-icon': { ml: 0.8, color: '#d32f2f' }
          }}
        />
      </Stack>

      {/* Location */}
      <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 'auto' }}>
        <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.7 }} />
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
          {room.district}, {room.city}
        </Typography>
      </Stack>
    </Box>
  );
};

export default RoomInfo;
