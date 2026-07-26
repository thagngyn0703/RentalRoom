import React from 'react';
import { Box, Typography, Slider, Button, Paper } from '@mui/material';

const PriceFilter = ({ draftPrice, setDraftPrice, applyPrice }) => {
  return (
    <>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption">VND 0</Typography>
          <Typography variant="caption">VND 20.000.000</Typography>
        </Box>
        <Slider
          value={draftPrice}
          onChange={(_, v) => setDraftPrice(v)}
          min={0}
          max={20}
          step={0.1}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => `${v.toFixed(1)}tr`}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Lên đến {draftPrice[1]}tr
        </Typography>
        <Button size="small" onClick={applyPrice}>Áp dụng</Button>
      </Paper>
    </>
  );
};

export default PriceFilter;
