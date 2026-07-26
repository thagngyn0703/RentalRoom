import React from 'react';
import { Typography, Grid, Button, Slider } from '@mui/material';
import { PRICE_PRESETS } from '../../constants/filterOptions';

const PriceRangeFilter = ({ selectedPriceKey, setSelectedPriceKey, draftPrice, setDraftPrice }) => {
  return (
    <>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Khoảng giá</Typography>
      <Grid container spacing={1} sx={{ mb: 1.5 }}>
        {PRICE_PRESETS.map((p) => (
          <Grid item key={p.key}>
            <Button
              size="small"
              variant={selectedPriceKey === p.key ? 'contained' : 'outlined'}
              onClick={() => {
                setSelectedPriceKey(p.key);
                setDraftPrice(p.range);
              }}
              sx={{ borderRadius: 3 }}
            >
              {p.label}
            </Button>
          </Grid>
        ))}
      </Grid>
      <Slider
        value={draftPrice}
        onChange={(_, v) => setDraftPrice(v)}
        min={0}
        max={20}
        step={0.5}
        valueLabelDisplay="auto"
        valueLabelFormat={(v) => `${v}tr`}
      />
    </>
  );
};

export default PriceRangeFilter;
