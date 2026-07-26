import React from 'react';
import { Typography, Grid, Button } from '@mui/material';
import { ROOM_TYPES } from '../../constants/filterOptions';

const CategoryFilter = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Loại hình</Typography>
      <Grid container spacing={1.2} sx={{ mb: 2 }}>
        {ROOM_TYPES.map((c) => (
          <Grid item key={c}>
            <Button
              variant={selectedCategory === c ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setSelectedCategory(c)}
              sx={{ borderRadius: 3 }}
            >
              {c}
            </Button>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default CategoryFilter;
