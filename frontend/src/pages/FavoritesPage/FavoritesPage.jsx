import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, TextField, InputAdornment, ToggleButtonGroup, ToggleButton, Menu, MenuItem, Stack, Chip, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FavoriteApi } from '../../services/api';
import { fetchAllRooms } from '../../services/api/postApi';
import { useToast } from '../../Components/ToastProvider';
import FilterSidebar from '../RoomsPage/components/FilterSidebar/FilterSidebar';
import FilterDialog from '../RoomsPage/components/FilterDialog/FilterDialog';
import RoomList from '../RoomsPage/components/RoomList/RoomList';
import { useFilters } from '../RoomsPage/hooks/useFilters';
import { DEFAULT_PAGE_SIZE } from '../RoomsPage/constants/filterOptions';

const MAX_FAVORITES = 20;

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const accessToken = useSelector((s) => s?.auth?.login?.accessToken);

  const [rooms, setRooms] = useState([]);
  const [favIds, setFavIds] = useState([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('popular');
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [locationAnchorEl, setLocationAnchorEl] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);

  const {
    filters,
    setFilters,
    draftPrice,
    setDraftPrice,
    draftArea,
    setDraftArea,
    draftTypes,
    setDraftTypes,
    draftUtilities,
    setDraftUtilities,
    applyPrice,
    applyArea,
    applyTypes,
    applyUtilities,
    toggleType,
    toggleUtility,
    removeUtility,
    clearAllFilters
  } = useFilters();

  const [selectedCategory, setSelectedCategory] = useState('Phòng trọ');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');
  const [provinceEl, setProvinceEl] = useState(null);
  const [districtEl, setDistrictEl] = useState(null);
  const [wardEl, setWardEl] = useState(null);
  const [selectedPriceKey, setSelectedPriceKey] = useState('all');
  const [selectedAreaKey, setSelectedAreaKey] = useState('all');
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const [provinces] = useState([
    { code: 1, name: 'Hà Nội' },
    { code: 79, name: 'TP. Hồ Chí Minh' }
  ]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const allRooms = await fetchAllRooms();
        setRooms(Array.isArray(allRooms) ? allRooms : []);
      } catch (err) {
        console.error('Error loading rooms for favorites:', err);
        setRooms([]);
      }
      if (!accessToken) {
        setFavIds([]);
        return;
      }
      try {
        const res = await FavoriteApi.getMyFavorites();
        const ids = (res?.favorites || []).map((f) => String(f.room?._id || f.clientRoomId || f.room));
        setFavIds(ids);
      } catch (err) {
        console.error('Error loading favorite ids:', err);
        setFavIds([]);
      }
    };
    load();

    const onFavUpdate = async () => {
      if (!accessToken) return;
      try {
        const res = await FavoriteApi.getMyFavorites();
        const ids = (res?.favorites || []).map((f) => String(f.room?._id || f.clientRoomId || f.room));
        setFavIds(ids);
      } catch (err) {
        console.error('Error refreshing favorite ids:', err);
      }
    };
    window.addEventListener('favoritesUpdated', onFavUpdate);
    return () => window.removeEventListener('favoritesUpdated', onFavUpdate);
  }, [accessToken]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  useEffect(() => {
    if (!selectedProvinceCode) {
      setDistricts([]);
      setWards([]);
      setSelectedDistrict('');
      setSelectedDistrictCode('');
      setSelectedWard('');
      setSelectedWardCode('');
      return;
    }
    const fetchDistricts = async () => {
      try {
        setLoadingDistricts(true);
        const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvinceCode}?depth=2`);
        if (response.ok) {
          const data = await response.json();
          setDistricts(data.districts || []);
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [selectedProvinceCode]);

  useEffect(() => {
    if (!selectedDistrictCode) {
      setWards([]);
      setSelectedWard('');
      setSelectedWardCode('');
      return;
    }
    const fetchWards = async () => {
      try {
        setLoadingWards(true);
        const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrictCode}?depth=2`);
        if (response.ok) {
          const data = await response.json();
          setWards(data.wards || []);
        }
      } catch (error) {
        console.error('Error fetching wards:', error);
      } finally {
        setLoadingWards(false);
      }
    };
    fetchWards();
  }, [selectedDistrictCode]);

  const favoriteRooms = useMemo(
    () => rooms.filter((r) => favIds.includes(String(r.id))),
    [rooms, favIds]
  );

  const filteredRooms = useMemo(() => {
    return favoriteRooms.filter((r) => {
      const priceInMillion = Number(r.price || 0) / 1000000;
      const area = Number(r.area || 0);
      const title = String(r.title || '').toLowerCase();
      const author = String(r.author || '').toLowerCase();
      const address = String(r.address || '').toLowerCase();
      const district = String(r.district || '').toLowerCase();
      const city = String(r.city || '').toLowerCase();
      const roomType = String(r.roomType || '');
      const utilities = Array.isArray(r.utilities) ? r.utilities : [];
      const keyword = search.trim().toLowerCase();

      const priceOk = priceInMillion >= filters.price[0] && priceInMillion <= filters.price[1];
      const areaOk = area >= filters.area[0] && area <= filters.area[1];
      const typeOk = filters.types.length === 0 ? true : filters.types.includes(roomType);
      const utilitiesOk =
        filters.utilities.length === 0
          ? true
          : filters.utilities.every((u) =>
              utilities.some((ru) => String(ru).toLowerCase() === String(u).toLowerCase())
            );
      const searchOk =
        keyword === ''
          ? true
          : title.includes(keyword) || address.includes(keyword) || district.includes(keyword) || city.includes(keyword) || author.includes(keyword);
      const provinceOk = selectedProvince ? city === String(selectedProvince).toLowerCase() : true;
      const districtOk = selectedDistrict ? district === String(selectedDistrict).toLowerCase() : true;
      const wardOk = selectedWard ? String(r.ward || '').toLowerCase() === String(selectedWard).toLowerCase() : true;

      return priceOk && areaOk && typeOk && utilitiesOk && searchOk && provinceOk && districtOk && wardOk;
    });
  }, [favoriteRooms, filters, search, selectedProvince, selectedDistrict, selectedWard]);

  const sortedRooms = useMemo(() => {
    if (sort === 'newest') return [...filteredRooms].sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
    if (sort === 'priceAsc') return [...filteredRooms].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sort === 'priceDesc') return [...filteredRooms].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    return filteredRooms;
  }, [filteredRooms, sort]);

  const total = sortedRooms.length;
  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));
  const currentItems = sortedRooms.slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE);
  const favoriteSet = useMemo(() => new Set(favIds.map(String)), [favIds]);

  const handleSortChange = (_e, value) => value && setSort(value);
  const openPriceMenu = (e) => setAnchorEl(e.currentTarget);
  const closePriceMenu = () => setAnchorEl(null);
  const openLocationMenu = (e) => setLocationAnchorEl(e.currentTarget);
  const closeLocationMenu = () => setLocationAnchorEl(null);
  const openFilterOverlay = () => setOpenFilter(true);
  const closeFilterOverlay = () => setOpenFilter(false);

  const applyPriceNow = () => {
    applyPrice();
    setPage(1);
  };
  const applyAreaNow = () => {
    applyArea();
    setPage(1);
  };
  const applyTypesNow = () => {
    applyTypes();
    setPage(1);
  };
  const applyUtilitiesNow = () => {
    applyUtilities();
    setPage(1);
  };

  const handleToggleTypeImmediate = (type) => {
    const updatedTypes = draftTypes.includes(type)
      ? draftTypes.filter((t) => t !== type)
      : [...draftTypes, type];
    setDraftTypes(updatedTypes);
    setFilters((prev) => ({ ...prev, types: updatedTypes }));
    setPage(1);
  };

  const handleRemoveType = (type) => {
    const updatedTypes = draftTypes.filter((t) => t !== type);
    setDraftTypes(updatedTypes);
    setFilters((prev) => ({ ...prev, types: updatedTypes }));
    setPage(1);
  };

  const handleClearPriceFilter = () => {
    setDraftPrice([0, 20]);
    setFilters((prev) => ({ ...prev, price: [0, 20] }));
    setPage(1);
  };

  const handleClearAreaFilter = () => {
    setDraftArea([0, 150]);
    setFilters((prev) => ({ ...prev, area: [0, 150] }));
    setPage(1);
  };

  const handleRemoveUtility = (utility) => {
    removeUtility(utility);
    setPage(1);
  };

  const clearLocation = () => {
    setSelectedProvince('');
    setSelectedProvinceCode('');
    setSelectedDistrict('');
    setSelectedDistrictCode('');
    setSelectedWard('');
    setSelectedWardCode('');
    setDistricts([]);
    setWards([]);
    setPage(1);
  };

  const handleProvinceSelect = (_code, name) => {
    setSelectedProvinceCode(_code);
    setSelectedProvince(name);
    setSelectedDistrict('');
    setSelectedDistrictCode('');
    setSelectedWard('');
    setSelectedWardCode('');
    setPage(1);
  };

  const handleDistrictSelect = (_code, name) => {
    setSelectedDistrictCode(_code);
    setSelectedDistrict(name);
    setSelectedWard('');
    setSelectedWardCode('');
    setPage(1);
  };

  const handleWardSelect = (_code, name) => {
    setSelectedWardCode(_code);
    setSelectedWard(name);
    setPage(1);
  };

  const clearAllFiltersAndReset = () => {
    clearAllFilters();
    setSelectedCategory('Phòng trọ');
    setCheckInDate('');
    setCheckOutDate('');
    setSelectedPriceKey('all');
    setSelectedAreaKey('all');
    setSelectedFeatures([]);
    clearLocation();
    setPage(1);
  };

  const applyFilters = () => {
    setFilters((f) => ({
      ...f,
      price: draftPrice,
      area: draftArea,
      types: draftTypes,
      utilities: draftUtilities
    }));
    setPage(1);
    closeFilterOverlay();
  };

  const toggleFavorite = async (roomId) => {
    if (!accessToken) {
      showToast('Vui lòng đăng nhập để lưu phòng yêu thích.', 'warning');
      return;
    }

    setFavIds((prev) => {
      const set = new Set(prev.map(String));
      const id = String(roomId);
      if (set.has(id)) {
        set.delete(id);
        FavoriteApi.removeFavorite(id).catch((e) => console.error('Error removing favorite:', e));
      } else {
        if (set.size >= MAX_FAVORITES) {
          showToast(`Bạn chỉ có thể lưu tối đa ${MAX_FAVORITES} phòng yêu thích.`, 'warning');
          return prev;
        }
        set.add(id);
        FavoriteApi.addFavorite(id).catch((e) => console.error('Error adding favorite:', e));
      }
      try {
        window.dispatchEvent(new Event('favoritesUpdated'));
      } catch (_) {}
      return Array.from(set);
    });
  };

  const handlePageChange = (_e, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderFilterFeature = () => (
    <Grid item xs={12} lg={2.5} sx={{ display: { xs: 'none', lg: 'block' }, '@media (max-width:1112px)': { display: 'none' } }}>
      <FilterSidebar
        draftPrice={draftPrice}
        setDraftPrice={setDraftPrice}
        draftArea={draftArea}
        setDraftArea={setDraftArea}
        draftTypes={draftTypes}
        applyPrice={applyPriceNow}
        applyArea={applyAreaNow}
        toggleType={toggleType}
        applyTypes={applyTypesNow}
      />
    </Grid>
  );

  const renderDialogFilter = () => (
    <FilterDialog
      openFilter={openFilter}
      closeFilterOverlay={closeFilterOverlay}
      checkInDate={checkInDate}
      checkOutDate={checkOutDate}
      setCheckInDate={setCheckInDate}
      setCheckOutDate={setCheckOutDate}
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
      selectedPriceKey={selectedPriceKey}
      setSelectedPriceKey={setSelectedPriceKey}
      draftPrice={draftPrice}
      setDraftPrice={setDraftPrice}
      selectedAreaKey={selectedAreaKey}
      setSelectedAreaKey={setSelectedAreaKey}
      draftArea={draftArea}
      setDraftArea={setDraftArea}
      draftUtilities={draftUtilities}
      toggleUtility={toggleUtility}
      draftTypes={draftTypes}
      onToggleTypeImmediate={handleToggleTypeImmediate}
      filters={filters}
      onRemoveType={handleRemoveType}
      onClearPriceFilter={handleClearPriceFilter}
      onClearAreaFilter={handleClearAreaFilter}
      onRemoveUtility={handleRemoveUtility}
      selectedFeatures={selectedFeatures}
      setSelectedFeatures={setSelectedFeatures}
      clearAllFilters={clearAllFiltersAndReset}
      applyFilters={applyFilters}
      setSearchParams={() => {}}
    />
  );

  const renderListRoomPage = () => (
    <Grid
      item
      xs={12}
      lg={7.5}
      sx={{
        mx: { xs: 0, md: 2, lg: 0 },
        px: { xs: 2, lg: 0 },
        '@media (max-width:1300px) and (min-width:1113px)': { flexBasis: '75%', maxWidth: '75%' },
        '@media (max-width:1112px) and (min-width:990px)': { flexBasis: '95%', maxWidth: '95%', mx: 3 }
      }}
    >
      <Box sx={{ width: '100%', py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.5rem', md: '2rem' }, color: 'text.primary' }}>
            Phòng yêu thích
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tìm kiếm trong {total} phòng yêu thích
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, bgcolor: 'background.paper', p: 2, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <ToggleButton value="filter" selected={openFilter} onClick={openFilterOverlay} sx={{ borderRadius: 2, px: 2 }}>
              <FilterAltOutlinedIcon sx={{ mr: 0.5 }} />
              Lọc
            </ToggleButton>

            <TextField
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') setPage(1);
              }}
              size="small"
              placeholder="Tìm kiếm theo tiêu đề, địa chỉ, người đăng..."
              sx={{
                flexGrow: 1,
                flex: { xs: '1 1 100%', sm: '1 1 auto' },
                minWidth: { xs: '100%', sm: 240 },
                bgcolor: '#f5f5f5',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                )
              }}
            />

            <Button variant="contained" size="medium" onClick={() => setPage(1)} startIcon={<SearchIcon />} sx={{ textTransform: 'none', borderRadius: 2, px: 3, whiteSpace: 'nowrap' }}>
              Tìm kiếm
            </Button>

            <ToggleButtonGroup value={sort} exclusive onChange={handleSortChange} size="small" sx={{ ml: { sm: 'auto' }, '& .MuiToggleButton-root': { px: 2, textTransform: 'none' } }}>
              <ToggleButton value="popular">Phổ biến</ToggleButton>
              <ToggleButton value="newest">Mới nhất</ToggleButton>
              <ToggleButton value="price" onClick={openPriceMenu}>Giá <ExpandMoreIcon fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closePriceMenu}>
              <MenuItem onClick={() => { setSort('priceAsc'); closePriceMenu(); }}>Giá tăng dần</MenuItem>
              <MenuItem onClick={() => { setSort('priceDesc'); closePriceMenu(); }}>Giá giảm dần</MenuItem>
            </Menu>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="outlined" size="small" onClick={openLocationMenu} endIcon={<ExpandMoreIcon />} startIcon={<LocationOnIcon />} sx={{ borderRadius: 2, textTransform: 'none', px: 2, whiteSpace: 'nowrap' }}>
              {selectedProvince || 'Chọn tỉnh/thành'}
            </Button>
            <Menu anchorEl={locationAnchorEl} open={Boolean(locationAnchorEl)} onClose={closeLocationMenu} PaperProps={{ sx: { maxHeight: 400 } }}>
              <MenuItem onClick={() => { clearLocation(); closeLocationMenu(); }} selected={!selectedProvince}>Tất cả</MenuItem>
              {provinces.map((province) => (
                <MenuItem key={province.code} onClick={() => { handleProvinceSelect(province.code, province.name); closeLocationMenu(); }} selected={selectedProvinceCode === province.code}>
                  {province.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {selectedProvince && <Chip label={selectedProvince} size="small" color="secondary" variant="outlined" onDelete={clearLocation} />}
          {selectedDistrict && <Chip label={selectedDistrict} size="small" color="secondary" variant="outlined" onDelete={() => setSelectedDistrict('')} />}
          {selectedWard && <Chip label={selectedWard} size="small" color="secondary" variant="outlined" onDelete={() => setSelectedWard('')} />}
          {filters.types.map((t) => <Chip key={t} label={t} size="small" color="primary" variant="outlined" onDelete={() => handleRemoveType(t)} />)}
          {filters.utilities.map((utility) => <Chip key={utility} label={utility} size="small" color="info" variant="outlined" onDelete={() => handleRemoveUtility(utility)} />)}
          {(filters.price[0] > 0 || filters.price[1] < 20) && <Chip label={`Giá: ${filters.price[0]} - ${filters.price[1]}tr`} size="small" color="success" variant="outlined" onDelete={handleClearPriceFilter} />}
          {(filters.area[0] > 0 || filters.area[1] < 150) && <Chip label={`DT: ${filters.area[0]} - ${filters.area[1]}m²`} size="small" color="info" variant="outlined" onDelete={handleClearAreaFilter} />}
          <Chip label={`Tổng: ${total}`} size="small" />
        </Stack>

        {!accessToken ? (
          <Box sx={{ textAlign: 'center', py: 6, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Typography sx={{ mb: 2 }}>Bạn cần đăng nhập để xem và lưu phòng yêu thích.</Typography>
            <Button variant="contained" onClick={() => navigate('/login')} sx={{ textTransform: 'none' }}>Đăng nhập</Button>
          </Box>
        ) : (
          <RoomList
            currentItems={currentItems}
            filters={filters}
            total={total}
            favorites={favoriteSet}
            toggleFavorite={toggleFavorite}
            handleViewDetails={(roomId) => navigate(`/room/${roomId}`)}
            totalPages={totalPages}
            page={page}
            handlePageChange={handlePageChange}
          />
        )}
      </Box>
    </Grid>
  );

  return (
    <Box sx={{ background: 'linear-gradient(135deg, rgba(8, 127, 114, 0.05) 0%, rgba(25, 59, 52, 0.05) 100%)', minHeight: 'calc(100vh - 70px)', width: '100%', m: 0, p: 0 }}>
      <Grid container spacing={3} sx={{ width: '100%', px: { xs: 2, lg: 0 } }}>
        {renderFilterFeature()}
        {renderListRoomPage()}
        <Grid item lg={2} sx={{ '@media (max-width:1300px)': { display: 'none' }, display: { xs: 'none', lg: 'block' } }} />
      </Grid>
      {renderDialogFilter()}
    </Box>
  );
};

export default FavoritesPage;
