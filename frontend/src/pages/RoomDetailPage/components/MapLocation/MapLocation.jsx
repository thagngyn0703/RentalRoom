import { Paper, Typography, Box, Button } from '@mui/material';

const MapLocation = ({ room }) => {
  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Vị Trí Trên Bản Đồ
        </Typography>
        <Button 
          variant="contained" 
          size="small"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${room.address}, ${room.ward ? room.ward + ', ' : ''}${room.district}, ${room.city}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textTransform: 'none' }}
        >
          Xem Trên Google Map
        </Button>
      </Box>
      
      <Box sx={{ 
        height: 400, 
        borderRadius: 2, 
        overflow: 'hidden',
        border: '1px solid #e0e0e0'
      }}>
        <iframe
          src={`https://www.google.com/maps?q=${encodeURIComponent(`${room.address}, ${room.ward ? room.ward + ', ' : ''}${room.district}, ${room.city}`)}&z=15&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Bản đồ ${room.title}`}
        />
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        <strong>Địa chỉ:</strong> {room.address}{room.ward ? `, ${room.ward}` : ''}, {room.district}, {room.city}
      </Typography>
    </Paper>
  );
};

export default MapLocation;
