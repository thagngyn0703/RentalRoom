import React from 'react';
import { Box, Chip } from '@mui/material';
import PriceFilter from './PriceFilter';
import AreaFilter from './AreaFilter';
import TypeFilter from './TypeFilter';

const FilterSidebar = ({
  draftPrice,
  setDraftPrice,
  draftArea,
  setDraftArea,
  draftTypes,
  applyPrice,
  applyArea,
  toggleType,
  applyTypes
}) => {
  return (
    <Box
      sx={{
        p: 2.5,
        border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 3,
        position: 'sticky',
        top: '100px',
        alignSelf: 'flex-start',
        mt: 3,
        minWidth: 0,
        width: '100%',

      }}
    >
      {/* Giá */}
      <Chip label="Giá" color="success" size="small" sx={{ borderRadius: 2, mb: 1 }} />
      <PriceFilter
        draftPrice={draftPrice}
        setDraftPrice={setDraftPrice}
        applyPrice={applyPrice}
      />

      {/* Diện tích */}
      <Chip label="Diện tích" color="success" size="small" sx={{ borderRadius: 2, mb: 1 }} />
      <AreaFilter
        draftArea={draftArea}
        setDraftArea={setDraftArea}
        applyArea={applyArea}
      />

      {/* Loại hình */}
      <Chip label="Loại hình" color="success" size="small" sx={{ borderRadius: 2, mb: 1 }} />
      <TypeFilter
        draftTypes={draftTypes}
        toggleType={toggleType}
        applyTypes={applyTypes}
      />

    </Box>
  );
};

export default FilterSidebar;
