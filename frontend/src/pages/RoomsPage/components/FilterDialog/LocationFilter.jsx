import React from 'react';
import { Typography, Grid, Button, Menu, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const LocationFilter = ({
  selectedProvince,
  selectedProvinceCode,
  setSelectedProvince,
  setSelectedProvinceCode,
  selectedDistrict,
  selectedDistrictCode,
  setSelectedDistrict,
  setSelectedDistrictCode,
  selectedWard,
  selectedWardCode,
  setSelectedWard,
  setSelectedWardCode,
  provinceEl,
  setProvinceEl,
  districtEl,
  setDistrictEl,
  wardEl,
  setWardEl,
  provinces = [],
  districts = [],
  wards = [],
  loadingDistricts,
  loadingWards,
  handleProvinceSelect,
  handleDistrictSelect,
  handleWardSelect,
  isFromDialog = true
}) => {
  return (
    <>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Lọc theo khu vực</Typography>
      <Grid container spacing={1.5} sx={{ mb: 1 }}>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="outlined"
            sx={{ justifyContent: 'space-between' }}
            endIcon={<ExpandMoreIcon />}
            onClick={(e) => setProvinceEl(e.currentTarget)}
          >
            {selectedProvince || 'Chọn tỉnh/thành'}
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="outlined"
            sx={{ justifyContent: 'space-between' }}
            endIcon={<ExpandMoreIcon />}
            onClick={(e) => setDistrictEl(e.currentTarget)}
            disabled={!selectedProvince || loadingDistricts}
          >
            {loadingDistricts ? 'Đang tải...' : (selectedDistrict || 'Chọn quận/huyện')}
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="outlined"
            sx={{ justifyContent: 'space-between' }}
            endIcon={<ExpandMoreIcon />}
            onClick={(e) => setWardEl(e.currentTarget)}
            disabled={!selectedDistrict || loadingWards}
          >
            {loadingWards ? 'Đang tải...' : (selectedWard || 'Chọn phường/xã')}
          </Button>
        </Grid>
      </Grid>

      {/* Province Menu */}
      <Menu anchorEl={provinceEl} open={Boolean(provinceEl)} onClose={() => setProvinceEl(null)}>
        <MenuItem
          onClick={() => {
            setSelectedProvince('');
            if (setSelectedProvinceCode) setSelectedProvinceCode('');
            setSelectedDistrict('');
            if (setSelectedDistrictCode) setSelectedDistrictCode('');
            setSelectedWard('');
            if (setSelectedWardCode) setSelectedWardCode('');
            setProvinceEl(null);
          }}
        >
          Tất cả
        </MenuItem>
        {provinces.map((province) => (
          <MenuItem
            key={province.code}
            onClick={() => {
              if (handleProvinceSelect) {
                handleProvinceSelect(province.code, province.name, isFromDialog);
              } else {
                setSelectedProvince(province.name);
              }
              setProvinceEl(null);
            }}
            selected={selectedProvinceCode === province.code}
          >
            {province.name}
          </MenuItem>
        ))}
      </Menu>

      {/* District Menu */}
      <Menu anchorEl={districtEl} open={Boolean(districtEl)} onClose={() => setDistrictEl(null)}>
        <MenuItem
          onClick={() => {
            setSelectedDistrict('');
            if (setSelectedDistrictCode) setSelectedDistrictCode('');
            setSelectedWard('');
            if (setSelectedWardCode) setSelectedWardCode('');
            setDistrictEl(null);
          }}
        >
          Tất cả
        </MenuItem>
        {districts.map((district) => (
          <MenuItem
            key={district.code}
            onClick={() => {
              if (handleDistrictSelect) {
                handleDistrictSelect(district.code, district.name, isFromDialog);
              } else {
                setSelectedDistrict(district.name);
              }
              setDistrictEl(null);
            }}
            selected={selectedDistrictCode === district.code}
          >
            {district.name}
          </MenuItem>
        ))}
      </Menu>

      {/* Ward Menu */}
      <Menu anchorEl={wardEl} open={Boolean(wardEl)} onClose={() => setWardEl(null)}>
        <MenuItem
          onClick={() => {
            setSelectedWard('');
            if (setSelectedWardCode) setSelectedWardCode('');
            setWardEl(null);
          }}
        >
          Tất cả
        </MenuItem>
        {wards.map((ward) => (
          <MenuItem
            key={ward.code}
            onClick={() => {
              if (handleWardSelect) {
                handleWardSelect(ward.code, ward.name, isFromDialog);
              } else {
                setSelectedWard(ward.name);
              }
              setWardEl(null);
            }}
            selected={selectedWardCode === ward.code}
          >
            {ward.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LocationFilter;
