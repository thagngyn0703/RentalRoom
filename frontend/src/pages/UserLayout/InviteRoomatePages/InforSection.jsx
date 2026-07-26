import React, { useState } from 'react';
import { Box, Typography, TextField, Grid, Button, useTheme } from '@mui/material';

/**
 * InforSection
 * Props: interests, setInterests, habits, setHabits, dislikes, setDislikes
 * Each list is edited via an input + add button and displays added items below.
 */
const InforSection = ({ interests = [], setInterests, habits = [], setHabits, dislikes = [], setDislikes }) => {
  const theme = useTheme();
  const [newInterest, setNewInterest] = useState('');
  const [newHabit, setNewHabit] = useState('');
  const [newDislike, setNewDislike] = useState('');

  const addItem = (value, setter) => {
    const v = (value || '').toString().trim();
    if (!v) return;
    setter(prev => [...(Array.isArray(prev) ? prev : []), v]);
  };

  const removeAt = (index, setter) => {
    setter(prev => (Array.isArray(prev) ? prev.filter((_, i) => i !== index) : []));
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" mb={1} sx={{ textAlign: 'left' }}>
        Thông tin tìm bạn ở ghép
      </Typography>

      {/* Interests */}
      <Grid container spacing={2} mb={1}>
        <Grid item xs={12} sm={8} md={8}>
          <Typography variant="body2" mb={0.5} sx={{ fontWeight: 'medium' }}>Sở thích</Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="VD: thích nấu ăn, thích im lặng..."
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            sx={{ bgcolor: '#f9f9f9' }}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Typography variant="body2" mb={0.5} sx={{ color: 'transparent' }}>.</Typography>
          <Button
            variant="contained"
            onClick={() => { addItem(newInterest, setInterests); setNewInterest(''); }}
            sx={{ height: '40px', width: '100%', bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: theme.palette.primary.dark } }}
          >
            Thêm +
          </Button>
        </Grid>
      </Grid>

      {Array.isArray(interests) && interests.length > 0 && (
        <Box sx={{ mb: 1 }}>
          {interests.map((it, idx) => (
            <Box key={`interest-${idx}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, mb: 1, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #ddd' }}>
              <Typography variant="body2">{it}</Typography>
              <Button size="small" color="error" onClick={() => removeAt(idx, setInterests)} sx={{ minWidth: 'auto', p: 0.5 }}>✕</Button>
            </Box>
          ))}
        </Box>
      )}

      {/* Habits */}
      <Grid container spacing={2} mb={1}>
        <Grid item xs={12} sm={8} md={8}>
          <Typography variant="body2" mb={0.5} sx={{ fontWeight: 'medium' }}>Thói quen</Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="VD: sống về đêm, hay dọn dẹp..."
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            sx={{ bgcolor: '#f9f9f9' }}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Typography variant="body2" mb={0.5} sx={{ color: 'transparent' }}>.</Typography>
          <Button
            variant="contained"
            onClick={() => { addItem(newHabit, setHabits); setNewHabit(''); }}
            sx={{ height: '40px', width: '100%', bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: theme.palette.primary.dark } }}
          >
            Thêm +
          </Button>
        </Grid>
      </Grid>

      {Array.isArray(habits) && habits.length > 0 && (
        <Box sx={{ mb: 1 }}>
          {habits.map((it, idx) => (
            <Box key={`habit-${idx}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, mb: 1, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #ddd' }}>
              <Typography variant="body2">{it}</Typography>
              <Button size="small" color="error" onClick={() => removeAt(idx, setHabits)} sx={{ minWidth: 'auto', p: 0.5 }}>✕</Button>
            </Box>
          ))}
        </Box>
      )}

      {/* Dislikes */}
      <Grid container spacing={2} mb={1}>
        <Grid item xs={12} sm={8} md={8}>
          <Typography variant="body2" mb={0.5} sx={{ fontWeight: 'medium' }}>Những điều không thích</Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="VD: ồn ào, hút thuốc..."
            value={newDislike}
            onChange={(e) => setNewDislike(e.target.value)}
            sx={{ bgcolor: '#f9f9f9' }}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Typography variant="body2" mb={0.5} sx={{ color: 'transparent' }}>.</Typography>
          <Button
            variant="contained"
            onClick={() => { addItem(newDislike, setDislikes); setNewDislike(''); }}
            sx={{ height: '40px', width: '100%', bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: theme.palette.primary.dark } }}
          >
            Thêm +
          </Button>
        </Grid>
      </Grid>

      {Array.isArray(dislikes) && dislikes.length > 0 && (
        <Box sx={{ mb: 1 }}>
          {dislikes.map((it, idx) => (
            <Box key={`dislike-${idx}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, mb: 1, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #ddd' }}>
              <Typography variant="body2">{it}</Typography>
              <Button size="small" color="error" onClick={() => removeAt(idx, setDislikes)} sx={{ minWidth: 'auto', p: 0.5 }}>✕</Button>
            </Box>
          ))}
        </Box>
      )}

    </Box>
  );
};

export default InforSection;
