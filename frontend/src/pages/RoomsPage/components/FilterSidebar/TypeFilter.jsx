import React from 'react';
import { Box, Button, Paper, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { ROOM_TYPES } from '../../constants/filterOptions';

const TypeFilter = ({ draftTypes, toggleType, applyTypes }) => {
  return (
    <>
      <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, mb: 2 }}>
        <List dense>
          {ROOM_TYPES.map((t) => (
            <ListItemButton key={t} onClick={() => toggleType(t)} selected={draftTypes.includes(t)}>
              <ListItemText primary={<Typography variant="body2">{t}</Typography>} />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ px: 1, pb: 1 }}>
          <Button size="small" onClick={applyTypes}>Áp dụng</Button>
        </Box>
      </Paper>
    </>
  );
};

export default TypeFilter;
