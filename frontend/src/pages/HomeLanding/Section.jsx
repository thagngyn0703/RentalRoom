import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Section = ({ title, children, sx = {} }) => {
  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 4 }}>
        <Box sx={{ width: 6, height: 24, bgcolor: 'primary.main', borderRadius: 1, mr: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{title}</Typography>
      </Box>
      <Box sx={(theme) => ({ bgcolor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.98)' : theme.palette.background.paper, borderRadius: 2, boxShadow: '0 8px 20px rgba(15,23,42,0.04)', border: '1px solid', borderColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'divider', p: { xs: 1, md: 2 } })}>
        {children}
      </Box>
    </Box>
  );
};

export default Section;
