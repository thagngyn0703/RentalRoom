import { Stack, IconButton, Typography, Tooltip } from '@mui/material';
import { ArrowBack, Favorite, FavoriteBorder, Share } from '@mui/icons-material';

const RoomHeader = ({ room, isFavorite, onBack, onToggleFavorite, favoritesLoading }) => {
  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
      <IconButton onClick={onBack} sx={{ bgcolor: 'grey.100' }}>
        <ArrowBack />
      </IconButton>
      <Typography variant="h4" sx={{ fontWeight: 700, flex: 1, minWidth: 0, overflowWrap: 'anywhere', fontSize: { xs: 20, md: 26 } }}>
        {room.title}
      </Typography>
      <Tooltip title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}>
        <IconButton disabled={favoritesLoading} onClick={onToggleFavorite} size="large" sx={{ bgcolor: 'grey.100' }}>
          {isFavorite ? <Favorite color="error" fontSize="large" /> : <FavoriteBorder fontSize="large" />}
        </IconButton>
      </Tooltip>
      <IconButton sx={{ bgcolor: 'grey.100' }}>
        <Share />
      </IconButton>
    </Stack>
  );
};

export default RoomHeader;
