import React from 'react';
import { Button, Paper, FormControlLabel, Checkbox, Typography } from '@mui/material';

const TrustFilter = ({ draftTrusts, setDraftTrusts, applyTrusts }) => {
  return (
    <>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={draftTrusts.vip}
              onChange={(e) => setDraftTrusts((s) => ({ ...s, vip: e.target.checked }))}
            />
          }
          label={<Typography variant="body2">VIP</Typography>}
        />
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={draftTrusts.verified}
              onChange={(e) => setDraftTrusts((s) => ({ ...s, verified: e.target.checked }))}
            />
          }
          label={<Typography variant="body2">Đã xác minh</Typography>}
        />
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={draftTrusts.normal}
              onChange={(e) => setDraftTrusts((s) => ({ ...s, normal: e.target.checked }))}
            />
          }
          label={<Typography variant="body2">Tin thường</Typography>}
        />
        <Button size="small" onClick={applyTrusts}>Áp dụng</Button>
      </Paper>
    </>
  );
};

export default TrustFilter;
