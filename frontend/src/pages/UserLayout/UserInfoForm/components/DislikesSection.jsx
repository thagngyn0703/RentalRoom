import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Paper
} from '@mui/material';
import { ThumbDownAlt } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const DislikesSection = ({ dislikes, onUpdateDislikes }) => {
  const theme = useTheme();
  const [newDislike, setNewDislike] = useState('');

  const addDislike = () => {
    if (newDislike.trim() && !dislikes.includes(newDislike.trim())) {
      onUpdateDislikes([...dislikes, newDislike.trim()]);
      setNewDislike('');
    }
  };

  const removeDislike = (index) => {
    const updatedDislikes = dislikes.filter((_, i) => i !== index);
    onUpdateDislikes(updatedDislikes);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDislike();
    }
  };

  return (
    <Paper 
      name="box-khong-thich" 
      sx={{ 
        flex: 1, 
        p: 0, // Bỏ padding chung
        bgcolor: theme.palette.formSections?.dislikes.background || 'rgba(255, 107, 107, 0.05)',
        border: `2px solid ${theme.palette.tertiary?.light || '#ff9999'}`,
        borderRadius: 3,
        boxShadow: `0 4px 12px ${theme.palette.formSections?.dislikes.shadow || 'rgba(255, 107, 107, 0.1)'}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 6px 20px ${theme.palette.formSections?.dislikes.shadowHover || 'rgba(255, 107, 107, 0.15)'}`,
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Header với padding */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 2, pt: 2 }}>
        <ThumbDownAlt sx={{ mr: 1, color: theme.palette.tertiary?.main || '#ff6b6b' }} />
        <Typography variant="h6" sx={{ color: theme.palette.tertiary?.main || '#ff6b6b', fontWeight: 600 }}>
         Điều không thích
        </Typography>
      </Box>
      
      {/* Chips area - padding nhỏ */}
      <Box name="chips-khong-thich" sx={{ mb: 1, minHeight: 60, px: 1 }}>
        {dislikes.map((item, index) => (
          <Chip
            key={index}
            label={item}
            onDelete={() => removeDislike(index)}
            sx={{ 
              mr: 1, 
              mb: 1,
              bgcolor: theme.palette.tertiary?.main || '#ff6b6b',
              color: 'white',
              '& .MuiChip-deleteIcon': { 
                color: 'white',
                '&:hover': { color: '#f0f0f0' }
              },
              '&:hover': {
                bgcolor: theme.palette.tertiary?.dark || '#e55555',
                transform: 'scale(1.05)'
              }
            }}
          />
        ))}
      </Box>
      
      {/* Input/Button area với padding */}
      <Box name="input-khong-thich" sx={{ 
        display: 'flex', 
        gap: 1,
        flexDirection: { xs: 'column', sm: 'row' }, // Mobile: dọc, Desktop: ngang
        px: 2, 
        pb: 2 // Padding cho input/button
      }}>
        <TextField
          fullWidth
          size="small"
          label="Thêm điều không thích"
          value={newDislike}
          onChange={(e) => setNewDislike(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white',
              '& fieldset': {
                borderColor: theme.palette.tertiary?.light || '#ff9999',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.tertiary?.main || '#ff6b6b',
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.tertiary?.main || '#ff6b6b',
                borderWidth: 2,
              },
            },
            '& .MuiInputLabel-root': {
              color: theme.palette.tertiary?.main || '#ff6b6b',
              '&.Mui-focused': {
                color: theme.palette.tertiary?.main || '#ff6b6b',
              },
            },
          }}
        />
        <Button
          onClick={addDislike}
          variant="contained"
          sx={{ 
            bgcolor: theme.palette.tertiary?.main || '#ff6b6b',
            minWidth: { xs: '100%', sm: 'auto' }, // Mobile: full width, Desktop: auto
            '&:hover': { 
              bgcolor: theme.palette.tertiary?.dark || '#e55555',
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${theme.palette.formSections?.dislikes.shadowHover || 'rgba(255, 107, 107, 0.3)'}`
            },
            transition: 'all 0.2s ease'
          }}
        >
          THÊM
        </Button>
      </Box>
    </Paper>
  );
};

export default DislikesSection;