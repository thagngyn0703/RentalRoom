import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Paper
} from '@mui/material';
import { FavoriteOutlined } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const InterestsSection = ({ interests, onUpdateInterests }) => {
  const theme = useTheme();
  const [newInterest, setNewInterest] = useState('');

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      onUpdateInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (index) => {
    const updatedInterests = interests.filter((_, i) => i !== index);
    onUpdateInterests(updatedInterests);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest();
    }
  };

  return (
    <Paper 
      name="box-so-thich" 
      sx={{ 
        flex: 1, 
        p: 0, // Bỏ padding chung
        bgcolor: theme.palette.formSections?.interests.background || 'rgba(53, 145, 196, 0.05)',
        border: `2px solid ${theme.palette.secondary.light}`,
        borderRadius: 3,
        boxShadow: `0 4px 12px ${theme.palette.formSections?.interests.shadow || 'rgba(53, 145, 196, 0.1)'}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 6px 20px ${theme.palette.formSections?.interests.shadowHover || 'rgba(53, 145, 196, 0.15)'}`,
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Header với padding */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 2, pt: 2 }}>
        <FavoriteOutlined sx={{ mr: 1, color: theme.palette.secondary.main }} />
        <Typography variant="h6" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
          Sở thích
        </Typography>
      </Box>
      
      {/* Chips area - padding nhỏ */}
      <Box name="chips-so-thich" sx={{ mb: 1, minHeight: 60, px: 1 }}>
        {interests.map((item, index) => (
          <Chip
            key={index}
            label={item}
            onDelete={() => removeInterest(index)}
            sx={{ 
              mr: 1, 
              mb: 1,
              bgcolor: theme.palette.secondary.main,
              color: 'white',
              '& .MuiChip-deleteIcon': { 
                color: 'white',
                '&:hover': { color: '#f0f0f0' }
              },
              '&:hover': {
                bgcolor: theme.palette.secondary.dark,
                transform: 'scale(1.05)'
              }
            }}
          />
        ))}
      </Box>
      
      {/* Input/Button area với padding */}
      <Box name="input-so-thich" sx={{ 
        display: 'flex', 
        gap: 1,
        flexDirection: { xs: 'column', sm: 'row' }, // Mobile: dọc, Desktop: ngang
        px: 2, 
        pb: 2 // Padding cho input/button
      }}>
        <TextField
          fullWidth
          size="small"
          label="Thêm sở thích"
          value={newInterest}
          onChange={(e) => setNewInterest(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white',
              '& fieldset': {
                borderColor: theme.palette.secondary.light,
              },
              '&:hover fieldset': {
                borderColor: theme.palette.secondary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.secondary.main,
                borderWidth: 2,
              },
            },
            '& .MuiInputLabel-root': {
              color: theme.palette.secondary.main,
              '&.Mui-focused': {
                color: theme.palette.secondary.main,
              },
            },
          }}
        />
        <Button
          onClick={addInterest}
          variant="contained"
          sx={{ 
            bgcolor: theme.palette.secondary.main,
            minWidth: { xs: '100%', sm: 'auto' }, // Mobile: full width, Desktop: auto
            '&:hover': { 
              bgcolor: theme.palette.secondary.dark,
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${theme.palette.formSections?.interests.shadowHover || 'rgba(53, 145, 196, 0.3)'}`
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

export default InterestsSection;