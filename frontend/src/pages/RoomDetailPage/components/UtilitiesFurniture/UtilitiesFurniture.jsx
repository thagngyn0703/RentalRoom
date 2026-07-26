import { Paper, Typography, Stack, Chip } from '@mui/material';

const UtilitiesFurniture = ({ utilities }) => {
  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Tiện Ích & Nội Thất
      </Typography>
      {Array.isArray(utilities) && utilities.length > 0 ? (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {utilities.map((u, idx) => (
            <Chip key={idx} label={u} variant="outlined" />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Chưa cập nhật
        </Typography>
      )}
    </Paper>
  );
};

export default UtilitiesFurniture;
