import React from 'react';
import { ToggleButtonGroup, ToggleButton, Menu, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const SortButtons = ({ sort, handleSortChange, anchorEl, openPriceMenu, closePriceMenu, setSort }) => {
  return (
    <>
      <ToggleButtonGroup
        value={sort}
        exclusive
        onChange={handleSortChange}
        size="small"
        sx={{ mr: 'auto' }}
      >
        <ToggleButton value="popular">Phổ biến</ToggleButton>
        <ToggleButton value="newest">Mới nhất</ToggleButton>
        <ToggleButton value="price" onClick={openPriceMenu}>
          Giá <ExpandMoreIcon fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closePriceMenu}>
        <MenuItem
          onClick={() => {
            setSort('priceAsc');
            closePriceMenu();
          }}
        >
          Giá tăng dần
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSort('priceDesc');
            closePriceMenu();
          }}
        >
          Giá giảm dần
        </MenuItem>
      </Menu>
    </>
  );
};

export default SortButtons;
