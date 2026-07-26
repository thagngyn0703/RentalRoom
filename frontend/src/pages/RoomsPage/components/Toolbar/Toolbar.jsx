import React from 'react';
import { Box, ToggleButton } from '@mui/material';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import SortButtons from './SortButtons';
import SearchBar from './SearchBar';

const Toolbar = ({
  openFilter,
  openFilterOverlay,
  sort,
  handleSortChange,
  anchorEl,
  openPriceMenu,
  closePriceMenu,
  setSort,
  search,
  setSearch,
  setPage
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
      <ToggleButton
        value="filter"
        selected={openFilter}
        onClick={openFilterOverlay}
        sx={{ borderRadius: 2, px: 1.5 }}
      >
        <FilterAltOutlinedIcon />
      </ToggleButton>

      <SortButtons
        sort={sort}
        handleSortChange={handleSortChange}
        anchorEl={anchorEl}
        openPriceMenu={openPriceMenu}
        closePriceMenu={closePriceMenu}
        setSort={setSort}
      />

      <SearchBar search={search} setSearch={setSearch} setPage={setPage} />
    </Box>
  );
};

export default Toolbar;
