import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Chip, Typography, Grid } from '@mui/material';
import DateRangeFilter from './DateRangeFilter';
import LocationFilter from './LocationFilter';
import PriceRangeFilter from './PriceRangeFilter';
import AreaRangeFilter from './AreaRangeFilter';
import FeatureFilter from './FeatureFilter';
import { ROOM_TYPES } from '../../constants/filterOptions';

const FilterDialog = ({
  openFilter,
  closeFilterOverlay,
  checkInDate,
  checkOutDate,
  setCheckInDate,
  setCheckOutDate,
  selectedProvince,
  setSelectedProvince,
  selectedProvinceCode,
  setSelectedProvinceCode,
  selectedDistrict,
  setSelectedDistrict,
  selectedDistrictCode,
  setSelectedDistrictCode,
  selectedWard,
  setSelectedWard,
  selectedWardCode,
  setSelectedWardCode,
  provinceEl,
  setProvinceEl,
  districtEl,
  setDistrictEl,
  wardEl,
  setWardEl,
  provinces,
  districts,
  wards,
  loadingDistricts,
  loadingWards,
  handleProvinceSelect,
  handleDistrictSelect,
  handleWardSelect,
  selectedPriceKey,
  setSelectedPriceKey,
  draftPrice,
  setDraftPrice,
  selectedAreaKey,
  setSelectedAreaKey,
  draftArea,
  setDraftArea,
  draftUtilities,
  toggleUtility,
  draftTypes,
  onToggleTypeImmediate,
  filters,
  onRemoveType,
  onClearPriceFilter,
  onClearAreaFilter,
  onRemoveUtility,
  selectedFeatures,
  setSelectedFeatures,
  clearAllFilters,
  applyFilters,
  setSearchParams
}) => {
  const handleClearAll = () => {
    clearAllFilters();
    setSearchParams(new URLSearchParams({ page: '1' }));
  };

  return (
    <Dialog open={openFilter} onClose={closeFilterOverlay} fullWidth maxWidth="md">
      <DialogTitle>Bộ lọc</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Loại hình</Typography>
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {ROOM_TYPES.map((type) => (
            <Grid item key={type}>
              <Button
                size="small"
                variant={draftTypes.includes(type) ? 'contained' : 'outlined'}
                onClick={() => onToggleTypeImmediate?.(type)}
                sx={{ borderRadius: 3 }}
              >
                {type}
              </Button>
            </Grid>
          ))}
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {filters?.types?.map((t) => (
            <Chip key={t} label={t} size="small" color="primary" variant="outlined" onDelete={() => onRemoveType?.(t)} />
          ))}
          {(filters?.price?.[0] > 0 || filters?.price?.[1] < 20) && (
            <Chip
              label={`Giá: ${filters.price[0]} - ${filters.price[1]}tr`}
              size="small"
              color="success"
              variant="outlined"
              onDelete={onClearPriceFilter}
            />
          )}
          {(filters?.area?.[0] > 0 || filters?.area?.[1] < 150) && (
            <Chip
              label={`DT: ${filters.area[0]} - ${filters.area[1]}m²`}
              size="small"
              color="info"
              variant="outlined"
              onDelete={onClearAreaFilter}
            />
          )}
          {filters?.utilities?.map((utility) => (
            <Chip key={utility} label={utility} size="small" color="secondary" variant="outlined" onDelete={() => onRemoveUtility?.(utility)} />
          ))}
        </Stack>
        <DateRangeFilter
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          setCheckInDate={setCheckInDate}
          setCheckOutDate={setCheckOutDate}
        />
        <LocationFilter
          selectedProvince={selectedProvince}
          selectedProvinceCode={selectedProvinceCode}
          setSelectedProvince={setSelectedProvince}
          setSelectedProvinceCode={setSelectedProvinceCode}
          selectedDistrict={selectedDistrict}
          selectedDistrictCode={selectedDistrictCode}
          setSelectedDistrict={setSelectedDistrict}
          setSelectedDistrictCode={setSelectedDistrictCode}
          selectedWard={selectedWard}
          selectedWardCode={selectedWardCode}
          setSelectedWard={setSelectedWard}
          setSelectedWardCode={setSelectedWardCode}
          provinceEl={provinceEl}
          setProvinceEl={setProvinceEl}
          districtEl={districtEl}
          setDistrictEl={setDistrictEl}
          wardEl={wardEl}
          setWardEl={setWardEl}
          provinces={provinces}
          districts={districts}
          wards={wards}
          loadingDistricts={loadingDistricts}
          loadingWards={loadingWards}
          handleProvinceSelect={handleProvinceSelect}
          handleDistrictSelect={handleDistrictSelect}
          handleWardSelect={handleWardSelect}
          isFromDialog={true}
        />
        <PriceRangeFilter
          selectedPriceKey={selectedPriceKey}
          setSelectedPriceKey={setSelectedPriceKey}
          draftPrice={draftPrice}
          setDraftPrice={setDraftPrice}
        />
        <AreaRangeFilter
          selectedAreaKey={selectedAreaKey}
          setSelectedAreaKey={setSelectedAreaKey}
          draftArea={draftArea}
          setDraftArea={setDraftArea}
        />
        <FeatureFilter
          draftUtilities={draftUtilities}
          toggleUtility={toggleUtility}
          selectedFeatures={selectedFeatures}
          setSelectedFeatures={setSelectedFeatures}
        />
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={handleClearAll}>
          Xóa tất cả bộ lọc
        </Button>
        <Button onClick={closeFilterOverlay}>Đóng</Button>
        <Button variant="contained" onClick={applyFilters}>
          Áp dụng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;
