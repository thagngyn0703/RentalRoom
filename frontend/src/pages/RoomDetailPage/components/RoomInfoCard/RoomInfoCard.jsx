import { Paper, Grid, Typography, Stack, Chip, Rating as MuiRating, Box } from '@mui/material';
import { LocationOn } from '@mui/icons-material';

const RoomInfoCard = ({ room, ratingStats }) => {
  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Grid container alignItems="center" spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {room.title}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <Chip label="Cho Thuê" color="primary" size="small" />
            <MuiRating value={Number(ratingStats.average) || 0} readOnly precision={0.5} size="small" />
            <Typography variant="body2" color="text.secondary">
              ({ratingStats.count} Reviews)
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LocationOn sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="body1" color="text.secondary">
              {room.district}, {room.city}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
              {room.price}  VND
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {room.area}m²
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RoomInfoCard;
