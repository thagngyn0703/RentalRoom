import React from 'react';
import { Typography, Grid, Button, Slider } from '@mui/material';

const AREA_PRESETS = [
  { key: 'all', label: 'Tất cả', range: [0, 150] },
  { key: 'lt20', label: 'Dưới 20m²', range: [0, 20] },
  { key: '20-30', label: '20 - 30m²', range: [20, 30] },
  { key: '30-50', label: '30 - 50m²', range: [30, 50] },
  { key: '50-70', label: '50 - 70m²', range: [50, 70] },
  { key: '70-100', label: '70 - 100m²', range: [70, 100] },
  { key: 'gt100', label: 'Trên 100m²', range: [100, 150] }
];

const AreaRangeFilter = ({ selectedAreaKey, setSelectedAreaKey, draftArea, setDraftArea }) => {
  return (
    <>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Diện tích (m²)</Typography>
      <Grid container spacing={1} sx={{ mb: 1.5 }}>
        {AREA_PRESETS.map((p) => (
          <Grid item key={p.key}>
            <Button
              size="small"
              variant={selectedAreaKey === p.key ? 'contained' : 'outlined'}
              onClick={() => {
                setSelectedAreaKey(p.key);
                setDraftArea(p.range);
              }}
              sx={{ borderRadius: 3 }}
            >
              {p.label}
            </Button>
          </Grid>
        ))}
      </Grid>
      <Slider
        value={draftArea}
        onChange={(_, v) => setDraftArea(v)}
        min={0}
        max={150}
        step={5}
        valueLabelDisplay="auto"
        valueLabelFormat={(v) => `${v}m²`}
      />
    </>
  );
};

export default AreaRangeFilter;
