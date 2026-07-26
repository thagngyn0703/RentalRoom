import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Stack, Avatar, Button } from '@mui/material';
import { Phone, Message, Save, ExpandLess, ExpandMore } from '@mui/icons-material';

const ContactCard = ({ room }) => {
  const [showContactCard, setShowContactCard] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowContactCard(false);
      } else {
        setShowContactCard(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Box sx={{ 
      position: 'fixed', 
      right: { xs: 12, md: 28 }, 
      bottom: { xs: 20, md: 28 }, 
      zIndex: 1200, 
      width: { xs: 330, md: 380 }
    }}>
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Liên hệ ngay
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowContactCard(!showContactCard)}
            startIcon={showContactCard ? <ExpandLess /> : <ExpandMore />}
            sx={{ textTransform: 'none', minWidth: 'auto', p: 1 }}
          >
            {showContactCard ? 'Ẩn' : 'Hiện'}
          </Button>
        </Box>
        
        {showContactCard && (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Avatar sx={{ width: 52, height: 52 }}>
                {(room.author || 'N').charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {room.author || 'Người đăng'}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Phone sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="body1" color="text.secondary">
                    {room.phone || '0123.456.789'}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1.25} sx={{ mt: 1.25 }}>
              <Button 
                variant="outlined" 
                size="medium" 
                startIcon={<Phone />} 
                sx={{ 
                  textTransform: 'none', 
                  flex: 1, 
                  borderRadius: 999, 
                  fontWeight: 600, 
                  height: 40 
                }}
              >
                Gọi ngay
              </Button>
              <Button 
                variant="contained" 
                size="medium" 
                startIcon={<Message />} 
                sx={{ 
                  textTransform: 'none', 
                  flex: 1, 
                  borderRadius: 999, 
                  fontWeight: 600, 
                  height: 40 
                }}
              >
                Gửi tin nhắn
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<Save />} 
                sx={{ textTransform: 'none', borderRadius: 999 }}
              >
                Lưu
              </Button>
            </Stack>
          </Paper>
        )}
      </Paper>
    </Box>
  );
};

export default ContactCard;
