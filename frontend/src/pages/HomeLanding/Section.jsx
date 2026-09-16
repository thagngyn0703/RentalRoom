import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Section = ({ title, children, sx = {} }) => {
  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 6, gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 750, fontSize: { xs: 22, md: 28 } }}>{title}</Typography>
        <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
      </Box>
      <Box>
        {children}
      </Box>
    </Box>
  );
};

export default Section;
