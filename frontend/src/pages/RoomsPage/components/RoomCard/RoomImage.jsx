import React from 'react';
import { Box, Tooltip, IconButton } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { roomThumbnail } from '../../../../utils/roomThumbnail';

const RoomImage = ({ room, favorites, toggleFavorite }) => {
  const isFavorite = favorites.has(room.id);

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 220, sm: 190 },
        width: { xs: '100%', sm: 240 },
        overflow: 'hidden',
        borderRadius: 2,
        bgcolor: '#edf3ec',
        alignSelf: 'stretch',
        flexShrink: 0
      }}
    >
      <Box
        component="img"
        loading="lazy"
        decoding="async"
        src={roomThumbnail(room.image)}
        alt={room.title}
        sx={{
          position: { xs: 'relative', sm: 'absolute' },
          top: { xs: '0', sm: '50%' },
          left: { xs: '0', sm: '50%' },
          transform: { xs: 'none', sm: 'translate(-50%, -50%)' },
          width: { xs: '100%', sm: 'auto' },
          minWidth: '100%',
          minHeight: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          display: 'block'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 6,
          left: 6,
          bgcolor: 'rgba(0,0,0,0.6)',
          color: 'white',
          px: 1,
          py: 0.2,
          borderRadius: 1,
          fontSize: 12
        }}
      >
        {Array.isArray(room.images) ? room.images.length : 1} ảnh
      </Box>
      <Tooltip title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}>
        <IconButton
          aria-label={isFavorite ? 'Bỏ yêu thích' : 'Lưu phòng yêu thích'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(room.id);
          }}
          size="medium"
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            bgcolor: 'rgba(255,255,255,0.9)'
          }}
        >
          {isFavorite ? (
            <FavoriteIcon color="error" fontSize="medium" />
          ) : (
            <FavoriteBorderIcon fontSize="medium" />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default RoomImage;
