import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Paper
} from '@mui/material';
import { Psychology } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const HabitsSection = ({ habits, onUpdateHabits }) => {
  const theme = useTheme();
  const [newHabit, setNewHabit] = useState('');

  const addHabit = () => {
    if (newHabit.trim() && !habits.includes(newHabit.trim())) {
      onUpdateHabits([...habits, newHabit.trim()]);
      setNewHabit('');
    }
  };

  const removeHabit = (index) => {
    const updatedHabits = habits.filter((_, i) => i !== index);
    onUpdateHabits(updatedHabits);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHabit();
    }
  };

  return (
    <Paper 
      name="box-thoi-quen" 
      sx={{ 
        flex: 1, 
        p: 0, // Bỏ padding chung
        bgcolor: theme.palette.formSections?.habits.background || 'rgba(51, 51, 102, 0.05)',
        border: `2px solid ${theme.palette.primary.light}`,
        borderRadius: 3,
        boxShadow: `0 4px 12px ${theme.palette.formSections?.habits.shadow || 'rgba(51, 51, 102, 0.1)'}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 6px 20px ${theme.palette.formSections?.habits.shadowHover || 'rgba(51, 51, 102, 0.15)'}`,
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Header với padding */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 2, pt: 2 }}>
        <Psychology sx={{ mr: 1, color: theme.palette.primary.main }} />
        <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
          Thói quen
        </Typography>
      </Box>
      
      {/* Chips area - padding nhỏ */}
      <Box name="chips-thoi-quen" sx={{ mb: 1, minHeight: 60, px: 1 }}>
        {habits.map((item, index) => (
          <Chip
            key={index}
            label={item}
            onDelete={() => removeHabit(index)}
            sx={{ 
              mr: 1, 
              mb: 1,
              bgcolor: theme.palette.primary.main,
              color: 'white',
              '& .MuiChip-deleteIcon': { 
                color: 'white',
                '&:hover': { color: '#f0f0f0' }
              },
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
                transform: 'scale(1.05)'
              }
            }}
          />
        ))}
      </Box>
      
      {/* Input/Button area với padding */}
      <Box name="input-thoi-quen" sx={{ 
        display: 'flex', 
        gap: 1,
        flexDirection: { xs: 'column', sm: 'row' }, // Mobile: dọc, Desktop: ngang
        px: 2, 
        pb: 2 // Padding cho input/button
      }}>
        <TextField
          fullWidth
          size="small"
          label="Thêm thói quen"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white',
              '& fieldset': {
                borderColor: theme.palette.primary.light,
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: 2,
              },
            },
            '& .MuiInputLabel-root': {
              color: theme.palette.primary.main,
              '&.Mui-focused': {
                color: theme.palette.primary.main,
              },
            },
          }}
        />
        <Button
          onClick={addHabit}
          variant="contained"
          sx={{ 
            bgcolor: theme.palette.primary.main,
            minWidth: { xs: '100%', sm: 'auto' }, // Mobile: full width, Desktop: auto
            '&:hover': { 
              bgcolor: theme.palette.primary.dark,
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${theme.palette.formSections?.habits.shadowHover || 'rgba(51, 51, 102, 0.3)'}`
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

export default HabitsSection;