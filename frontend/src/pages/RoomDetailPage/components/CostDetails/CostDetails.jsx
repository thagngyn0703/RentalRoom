import { Paper, Typography, Stack } from '@mui/material';

const CostDetails = ({ room }) => {
  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Chi Phí
      </Typography>
      <Stack spacing={1.2}>
        <Stack direction="row" spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Giá thuê/tháng:</Typography>
          <Typography variant="body2">{room.price} {room.unit}</Typography>
        </Stack>
        {Array.isArray(room.additionalCosts) && room.additionalCosts.length > 0 ? (
          room.additionalCosts.map((c, idx) => (
            <Stack key={idx} direction="row" spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.type}:</Typography>
              <Typography variant="body2">{c.frequency}</Typography>
            </Stack>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            Chưa cập nhật chi phí phát sinh
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

export default CostDetails;
