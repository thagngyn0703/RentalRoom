import React from 'react';
import { Typography, Grid, Button } from '@mui/material';
import { FEATURE_OPTIONS } from '../../constants/filterOptions';

const FeatureFilter = ({ draftUtilities, toggleUtility }) => {
  return (
    <>
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Tiện ích / Nội thất</Typography>
      <Grid container spacing={1}>
        {FEATURE_OPTIONS.map((f) => (
          <Grid item key={f}>
            <Button
              size="small"
              variant={draftUtilities.includes(f) ? 'contained' : 'outlined'}
              onClick={() => toggleUtility(f)}
              sx={{ borderRadius: 3 }}
            >
              {f}
            </Button>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default FeatureFilter;
