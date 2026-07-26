import { useState } from 'react';
import { Paper, Box, IconButton } from '@mui/material';
import { NavigateBefore, NavigateNext, Close } from '@mui/icons-material';

const ImageGallery = ({ room }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

  const images = Array.isArray(room.images) && room.images.length > 0 ? room.images : [room.image].filter(Boolean);
  const total = images.length;
  const current = Math.min(currentImageIndex, Math.max(0, total - 1));
  
  const goPrev = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((i) => (i - 1 + total) % total);
  };
  
  const goNext = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((i) => (i + 1) % total);
  };

  return (
    <>
      <Paper sx={{ overflow: 'hidden', borderRadius: 2, mb: 3, p: { xs: 0.5, md: 1 } }}>
        <Box 
          sx={{ 
            position: 'relative', 
            height: { xs: 300, md: 420 }, 
            borderRadius: 2, 
            overflow: 'hidden', 
            cursor: 'zoom-in' 
          }} 
          onClick={() => setImageViewerOpen(true)}
        >
          <Box 
            component="img" 
            src={images[current]}
            alt={`${room.title} ${current + 1}`}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {total > 1 && (
            <>
              <IconButton 
                onClick={goPrev} 
                sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: 8, 
                  transform: 'translateY(-50%)', 
                  bgcolor: 'rgba(0,0,0,0.5)', 
                  color: 'white', 
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } 
                }}
              >
                <NavigateBefore />
              </IconButton>
              <IconButton 
                onClick={goNext} 
                sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  right: 8, 
                  transform: 'translateY(-50%)', 
                  bgcolor: 'rgba(0,0,0,0.5)', 
                  color: 'white', 
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } 
                }}
              >
                <NavigateNext />
              </IconButton>
              <Box 
                sx={{ 
                  position: 'absolute', 
                  right: 12, 
                  bottom: 12, 
                  bgcolor: 'rgba(0,0,0,0.55)', 
                  color: 'white', 
                  px: 1, 
                  py: 0.3, 
                  borderRadius: 1, 
                  fontSize: 12, 
                  fontWeight: 600 
                }}
              >
                {current + 1}/{total}
              </Box>
            </>
          )}
        </Box>
        {total > 1 && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1, overflowX: 'auto', pb: 0.5 }}>
            {images.map((img, idx) => (
              <Box 
                key={idx} 
                onClick={() => setCurrentImageIndex(idx)} 
                sx={{ 
                  cursor: 'pointer', 
                  borderRadius: 1, 
                  overflow: 'hidden', 
                  flex: '0 0 auto', 
                  border: idx === current ? '2px solid #1976d2' : '1px solid #e0e0e0' 
                }}
              >
                <Box 
                  component="img" 
                  src={img} 
                  alt={`${room.title} thumb ${idx + 1}`} 
                  sx={{ width: 120, height: 90, objectFit: 'cover', display: 'block' }} 
                />
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* Image Viewer Modal */}
      {imageViewerOpen && (
        <Box 
          onClick={() => setImageViewerOpen(false)} 
          sx={{ 
            position: 'fixed', 
            inset: 0, 
            bgcolor: 'rgba(0,0,0,0.9)', 
            zIndex: 2000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            p: 2 
          }}
        >
          <IconButton 
            onClick={(e) => { 
              e.stopPropagation(); 
              setImageViewerOpen(false); 
            }} 
            sx={{ 
              position: 'absolute', 
              top: 12, 
              right: 12, 
              bgcolor: 'rgba(255,255,255,0.9)' 
            }}
          >
            <Close />
          </IconButton>
          {total > 1 && (
            <IconButton 
              onClick={goPrev} 
              sx={{ 
                position: 'absolute', 
                left: 16, 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white' 
              }}
            >
              <NavigateBefore />
            </IconButton>
          )}
          <Box 
            component="img" 
            src={images[current]} 
            alt={`${room.title} full ${current + 1}`} 
            sx={{ 
              maxWidth: '92vw', 
              maxHeight: '92vh', 
              objectFit: 'contain', 
              borderRadius: 1 
            }} 
          />
          {total > 1 && (
            <IconButton 
              onClick={goNext} 
              sx={{ 
                position: 'absolute', 
                right: 16, 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white' 
              }}
            >
              <NavigateNext />
            </IconButton>
          )}
        </Box>
      )}
    </>
  );
};

export default ImageGallery;
