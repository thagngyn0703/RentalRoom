import React from 'react';
import { Box, Typography, Slider, Button, Paper } from '@mui/material';

const AreaFilter = ({ draftArea, setDraftArea, applyArea }) => {
  return (
    <>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption">0m²</Typography>
          <Typography variant="caption">+150m²</Typography>
        </Box>
        <Slider
          value={draftArea}
          onChange={(_, v) => setDraftArea(v)}
          min={0}
          max={150}
          step={1}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => `${v}m²`}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Lên đến {draftArea[1]}m²
        </Typography>
        <Button size="small" onClick={applyArea}>Áp dụng</Button>
      </Paper>
    </>
  );
};

export default AreaFilter;
