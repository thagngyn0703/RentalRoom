import { Paper, Typography, Grid, Card, Box, CardContent, Stack, Chip, Button, IconButton, Rating as MuiRating } from '@mui/material';
import { LocationOn, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SimilarRooms = ({ 
  similarRooms, 
  favorites, 
  setFavorites, 
  accessToken, 
  showToast,
  FavoriteApi 
}) => {
  const navigate = useNavigate();

  const handleToggleFavorite = async (roomId) => {
    if (!accessToken) {
      if (showToast) showToast('Vui lòng đăng nhập để lưu phòng yêu thích.', 'warning');
      return;
    }
    const newFavorites = new Set(favorites);
    if (newFavorites.has(roomId)) {
      newFavorites.delete(roomId);
      try { await FavoriteApi.removeFavorite(roomId); } catch (_) {}
    } else {
      newFavorites.add(roomId);
      try { await FavoriteApi.addFavorite(roomId); } catch (_) {}
    }
    setFavorites(newFavorites);
    try { window.dispatchEvent(new Event('favoritesUpdated')); } catch (_) {}
  };

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Phòng Trọ Tương Tự
      </Typography>
      <Grid container spacing={1.5} alignItems="stretch" sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        {similarRooms.map((similarRoom) => (
          <Grid 
            item 
            xs={12} 
            sm={4} 
            md={4} 
            key={similarRoom.id} 
            sx={{ 
              display: 'flex', 
              flex: { md: '1 0 0' }, 
              maxWidth: { md: '33.3333%' }, 
              minWidth: 0 
            }}
          >
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%', 
                width: '100%',
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                }
              }}
            >
              <Box sx={{ 
                position: 'relative', 
                height: 140, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden' 
              }}>
                <Box 
                  component="img" 
                  src={similarRoom.image} 
                  alt={similarRoom.title}
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    objectPosition: 'center center',
                    display: 'block'
                  }} 
                />
                <IconButton 
                  size="small" 
                  onClick={() => handleToggleFavorite(similarRoom.id)}
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8,
                    bgcolor: 'rgba(255,255,255,0.9)'
                  }}
                >
                  {favorites.has(similarRoom.id) ? 
                    <Favorite color="error" fontSize="small" /> : 
                    <FavoriteBorder fontSize="small" />
                  }
                </IconButton>
              </Box>
              <CardContent sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 1.25
              }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.4, fontSize: '0.85rem' }}>
                    {similarRoom.title}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.4 }}>
                    <MuiRating value={3} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      ID:{similarRoom.id}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.4 }}>
                    <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {similarRoom.district}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', fontSize: '0.75rem' }}>
                      {similarRoom.area}m²
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} sx={{ mb: 0.4, flexWrap: 'wrap' }}>
                    {similarRoom.utilities?.slice(0, 2).map((utility, index) => (
                      <Chip 
                        key={index} 
                        label={utility} 
                        size="small" 
                        variant="outlined" 
                        sx={{ fontSize: '0.7rem', height: 20 }} 
                      />
                    ))}
                  </Stack>
                  <Box sx={{ mb: 0.8 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      {similarRoom.price}
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  fullWidth
                  onClick={() => navigate(`/room/${similarRoom.id}`)}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.5 }}
                >
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button 
          variant="contained" 
          onClick={() => navigate('/rooms')}
          sx={{ textTransform: 'none' }}
        >
          Xem Thêm
        </Button>
      </Box>
    </Paper>
  );
};

export default SimilarRooms;
