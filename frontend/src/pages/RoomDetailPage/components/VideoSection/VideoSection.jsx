import { Paper, Typography, Box } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';

const VideoSection = ({ room }) => {
  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Video
      </Typography>
      <Box sx={{ position: 'relative', height: { xs: 360, md: 480 }, borderRadius: 2, overflow: 'hidden' }}>
        <Box 
          component="img" 
          src={room.image} 
          alt="Video thumbnail"
          sx={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }} 
        />
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'rgba(0,0,0,0.7)',
          borderRadius: '50%',
          p: 2,
          cursor: 'pointer'
        }}>
          <PlayArrow sx={{ fontSize: 40, color: 'white' }} />
        </Box>
      </Box>
    </Paper>
  );
};

export default VideoSection;
