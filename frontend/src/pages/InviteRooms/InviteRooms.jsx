import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FavoriteApi } from '../../services/api';
import { fetchAllRooms, fetchPostByRoom } from '../../services/api/postApi';
import { Box, Typography, Chip, Grid, Stack, Slider, Button, Checkbox, FormControlLabel, Paper, List, ListItemButton, ListItemText, Pagination, TextField, InputAdornment, ToggleButton, ToggleButtonGroup, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
// useTheme removed - not needed in this page
import { useNavigate } from 'react-router-dom';

const InviteRooms = () => {
  const MAX_FAVORITES = 20;
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  // Bộ lọc chính đang áp dụng
  const [filters, setFilters] = useState({
    price: [0, 20], // đơn vị: triệu VND/tháng (tăng lên 20 để bao gồm tất cả phòng)
    area: [0, 150], // m2 (tăng lên 150 để bao gồm tất cả phòng)
    types: [], // ['Phòng trọ', 'Căn hộ mini', ...]
    trusts: { vip: false, verified: false, normal: true }
  });

  // State tạm cho UI (chỉ áp dụng khi bấm "Áp dụng")
  const [draftPrice, setDraftPrice] = useState([0, 20]);
  const [draftArea, setDraftArea] = useState([0, 150]);
  const [draftTypes, setDraftTypes] = useState([]);
  const [draftTrusts, setDraftTrusts] = useState({ vip: false, verified: false, normal: true });

  useEffect(() => {
    const load = async () => {
      try {
        console.log('🔄 Đang tải danh sách phòng trọ...');
        const all = await fetchAllRooms();
        console.log('✅ Dữ liệu phòng trọ từ API:', all);
        // filter to invite-type posts only (support a few string variants)
        const invite = Array.isArray(all) ? all.filter(r => {
          const t = String(r.postType || r.postType || '').toLowerCase();
          return t.includes('invite') || t.includes('roomate') || t.includes('roommate') || t.includes('invite_room') || t.includes('invite-room');
        }) : [];
        setRooms(invite);
      } catch (e) {
        console.error('❌ Lỗi khi tải phòng trọ:', e);
        setRooms([]);
      }
    };
    load();
  }, []);

  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState('popular');
  const [anchorEl, setAnchorEl] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);
  // Overlay button-based selections
  const categoryOptions = ['Phòng trọ', 'Nhà riêng', 'Ở ghép', 'Mặt bằng', 'Căn hộ chung cư', 'Căn hộ mini', 'Căn hộ dịch vụ'];
  const [selectedCategory, setSelectedCategory] = useState('Phòng trọ');
  const [selectedProvince, setSelectedProvince] = useState('Toàn quốc');
  const [selectedDistrict, setSelectedDistrict] = useState('Tất cả');
  const [selectedWard, setSelectedWard] = useState('Tất cả');
  const [provinceEl, setProvinceEl] = useState(null);
  const [districtEl, setDistrictEl] = useState(null);
  const [wardEl, setWardEl] = useState(null);
  const pricePresets = [
    { key: 'all', label: 'Tất cả', range: [0, 10] },
    { key: 'lt1', label: 'Dưới 1 triệu', range: [0, 1] },
    { key: '1-2', label: '1 - 2 triệu', range: [1, 2] },
    { key: '2-3', label: '2 - 3 triệu', range: [2, 3] },
    { key: '3-5', label: '3 - 5 triệu', range: [3, 5] },
    { key: '5-7', label: '5 - 7 triệu', range: [5, 7] },
    { key: '7-10', label: '7 - 10 triệu', range: [7, 10] },
    { key: '10-15', label: '10 - 15 triệu', range: [10, 15] },
    { key: 'gt15', label: 'Trên 15 triệu', range: [15, 50] }
  ];
  const [selectedPriceKey, setSelectedPriceKey] = useState('all');
  const featureOptions = ['Đầy đủ nội thất', 'Có gác', 'Kệ bếp', 'Có máy lạnh', 'Có máy giặt', 'Có tủ lạnh', 'Có thang máy', 'Không chung chủ', 'Giờ giấc tự do', 'Có bảo vệ 24/24', 'Có hầm để xe'];
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  // Build location options from data
  const provinceOptions = Array.from(new Set(rooms.map(r => r.city).filter(Boolean)));
  const districtOptions = Array.from(new Set(rooms.filter(r => selectedProvince === 'Toàn quốc' || (r.city || '').toLowerCase() === selectedProvince.toLowerCase()).map(r => r.district).filter(Boolean)));
  const wardOptions = Array.from(new Set(rooms.filter(r => {
    const cityOk = selectedProvince === 'Toàn quốc' || (r.city || '').toLowerCase() === selectedProvince.toLowerCase();
    const distOk = selectedDistrict === 'Tất cả' || (r.district || '').toLowerCase() === selectedDistrict.toLowerCase();
    return cityOk && distOk;
  }).map(r => r.ward).filter(Boolean)));

  const filteredRooms = rooms.filter((r) => {
    // Chuyển đổi giá từ VND sang triệu VND để so sánh với filter
    const priceInMillion = r.price / 1000000;
    const priceOk = priceInMillion >= filters.price[0] && priceInMillion <= filters.price[1];
    const areaOk = r.area >= filters.area[0] && r.area <= filters.area[1];
    const typeOk = filters.types.length === 0 ? true : filters.types.includes(r.roomType);
    const searchOk = search.trim() === '' ? true : (
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.address?.toLowerCase().includes(search.toLowerCase()) ||
      r.district?.toLowerCase().includes(search.toLowerCase()) ||
      r.city?.toLowerCase().includes(search.toLowerCase())
    );
    const provinceOk = selectedProvince === 'Toàn quốc' ? true : ((r.city || '').toLowerCase() === selectedProvince.toLowerCase());
    const districtOk = selectedDistrict === 'Tất cả' ? true : ((r.district || '').toLowerCase() === selectedDistrict.toLowerCase());
    const wardOk = selectedWard === 'Tất cả' ? true : ((r.ward || '').toLowerCase() === selectedWard.toLowerCase());
    const featuresOk = selectedFeatures.length === 0 ? true : (Array.isArray(r.utilities) && selectedFeatures.every(f => r.utilities.some(u => (u || '').toLowerCase() === f.toLowerCase())));
    // trusts chưa có dữ liệu trong data.json, nên tạm thời không lọc theo
    return priceOk && areaOk && typeOk && searchOk && provinceOk && districtOk && wardOk && featuresOk;
  });

  // Debug log để kiểm tra dữ liệu
  console.log('📊 Tổng số phòng trọ (invite):', rooms.length);
  console.log('🔍 Phòng trọ sau khi lọc:', filteredRooms.length);
  console.log('📋 Dữ liệu phòng trọ mẫu:', rooms.slice(0, 2));

  const sortRooms = (list) => {
    if (sort === 'newest') {
      return [...list].sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
    }
    if (sort === 'priceAsc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sort === 'priceDesc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list; // 'popular' placeholder
  };

  const sortedRooms = sortRooms(filteredRooms);
  const totalPages = Math.max(1, Math.ceil(sortedRooms.length / pageSize));
  const currentItems = sortedRooms.slice((page - 1) * pageSize, page * pageSize);
  const handlePageChange = (_e, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleSortChange = (_e, value) => { if (value) setSort(value); };
  const openPriceMenu = (e) => setAnchorEl(e.currentTarget);
  const closePriceMenu = () => setAnchorEl(null);
  const openFilterOverlay = () => setOpenFilter(true);
  const closeFilterOverlay = () => setOpenFilter(false);
  // Khi đổi trang (kể cả khi áp dụng bộ lọc về trang 1), cuộn lên đầu
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);
  const clearAllFilters = () => {
    setSelectedCategory('Phòng trọ');
    setDraftPrice([0, 20]);
    setDraftArea([0, 150]);
    setDraftTypes([]);
    setSelectedPriceKey('all');
    setSelectedFeatures([]);
    setSelectedProvince('Toàn quốc');
    setSelectedDistrict('Tất cả');
    setSelectedWard('Tất cả');
    // Reset main filters as well
    setFilters((prev) => ({ ...prev, price: [0, 20], area: [0, 150], types: [] }));
    setPage(1);
  };

  // Favorites (in-memory for anonymous users). Backend calls only if user is authenticated.
  const accessToken = useSelector((st) => st?.auth?.login?.accessToken);

  const [favorites, setFavorites] = useState(new Set());

  // Load favorites from backend when authenticated
  useEffect(() => {
    (async () => {
      try {
        if (!accessToken) {
          setFavorites(new Set());
          return;
        }
        const res = await FavoriteApi.getMyFavorites();
        const ids = (res?.favorites || []).map(f => String(f.room?._id || f.clientRoomId || f.room));
        setFavorites(new Set(ids));
      } catch (_) {}
    })();
  }, [accessToken]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (accessToken) FavoriteApi.removeFavorite(id).catch(() => {});
      } else {
        if (next.size >= MAX_FAVORITES) {
          try { alert(`Bạn chỉ có thể lưu tối đa ${MAX_FAVORITES} phòng yêu thích.`); } catch (_) {}
          return prev;
        }
        next.add(id);
        if (accessToken) FavoriteApi.addFavorite(id).catch(() => {});
      }
      try { window.dispatchEvent(new Event('favoritesUpdated')); } catch (_) {}
      return next;
    });
  };

  const handleViewDetails = async (roomId, postId) => {
    try {
      if (postId) {
        navigate(`/invite/${postId}`);
        return;
      }
      // Try to fetch post by room id and navigate to invite detail if found
      const res = await fetchPostByRoom(roomId);
      const post = res?.post || null;
      const pid = post?._id || post?.postId || post?.id || null;
      if (pid) {
        navigate(`/invite/${pid}`);
        return;
      }
      // Fallback to room detail if no post found
      navigate(`/room/${roomId}`);
    } catch (e) {
      console.error('Error resolving post for room:', e);
      navigate(`/room/${roomId}`);
    }
  };

  const applyPrice = () => setFilters((f) => ({ ...f, price: draftPrice }));
  const applyArea = () => setFilters((f) => ({ ...f, area: draftArea }));
  const applyTypes = () => setFilters((f) => ({ ...f, types: draftTypes }));
  const applyTrusts = () => setFilters((f) => ({ ...f, trusts: draftTrusts }));

  const toggleType = (type) => {
    setDraftTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  return (
    <Box sx={{ bgcolor: '#f7f7f7', minHeight: 'calc(100vh - 70px)', width: '100%', m: 0, p: 0 }}>
      <Grid container spacing={0} sx={{ width: '100%', m: 0 }}>
        {/* LEFT COLUMN: Filter */}
        <Grid item xs={12} lg={2} sx={{ display: { xs: 'none', lg: 'block' }, '@media (max-width:1112px)': { display: 'none' } }}>
          <Box sx={{ p: { lg: 1.5, xl: 2 }, borderRight: '1px solid #eee', position: 'sticky', top: '70px', alignSelf: 'flex-start', ml: 0, minWidth: 220, width: { lg: 240, xl: 300 }, '@media (max-width:1200px) and (min-width:1113px)': { width: 220, p: 1.25 } }}>
          

          {/* Giá */}
          <Chip label="Giá" color="success" size="small" sx={{ borderRadius: 2, mb: 1 }} />
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption">VND 0</Typography>
              <Typography variant="caption">VND 20.000.000</Typography>
            </Box>
            <Slider
              value={draftPrice}
              onChange={(_, v) => setDraftPrice(v)}
              min={0}
              max={20}
              step={0.1}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v.toFixed(1)}tr`}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Lên đến {draftPrice[1]}tr
            </Typography>
            <Button size="small" onClick={applyPrice}>Áp dụng</Button>
          </Paper>

          {/* Diện tích */}
          <Chip label="Diện tích" color="success" size="small" sx={{ borderRadius: 2, mb: 1 }} />
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption">0m²</Typography>
              <Typography variant="caption">+150m²</Typography>
            </Box>
            <Slider
              value={draftArea}
              onChange={(_, v) => setDraftArea(v)}
              min={0}
              max={150}
              step={1}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}m²`}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Lên đến {draftArea[1]}m²
            </Typography>
            <Button size="small" onClick={applyArea}>Áp dụng</Button>
          </Paper>

          {/* Loại hình */}
          <Chip label="Loại hình" color="success" size="small" sx={{ borderRadius: 2, mb: 1 }} />
          <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, mb: 2 }}>
            <List dense>
              {['Phòng trọ', 'Căn hộ mini', 'Nhà nguyên căn', 'Ở ghép', 'Studio', 'Căn hộ 1PN'].map((t) => (
                <ListItemButton key={t} onClick={() => toggleType(t)} selected={draftTypes.includes(t)}>
                  <ListItemText primary={<Typography variant="body2">{t}</Typography>} />
                </ListItemButton>
              ))}
            </List>
            <Box sx={{ px: 1, pb: 1 }}>
              <Button size="small" onClick={applyTypes}>Áp dụng</Button>
            </Box>
          </Paper>

          {/* Độ tin cậy & Xác minh */}
          <Chip label="Độ tin cậy & Xác minh" color="success" size="small" sx={{ borderRadius: 2, mb: 1 }} />
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
            <FormControlLabel control={<Checkbox size="small" checked={draftTrusts.vip} onChange={(e) => setDraftTrusts((s) => ({ ...s, vip: e.target.checked }))} />} label={<Typography variant="body2">VIP</Typography>} />
            <FormControlLabel control={<Checkbox size="small" checked={draftTrusts.verified} onChange={(e) => setDraftTrusts((s) => ({ ...s, verified: e.target.checked }))} />} label={<Typography variant="body2">Đã xác minh</Typography>} />
            <FormControlLabel control={<Checkbox size="small" checked={draftTrusts.normal} onChange={(e) => setDraftTrusts((s) => ({ ...s, normal: e.target.checked }))} />} label={<Typography variant="body2">Tin thường</Typography>} />
            <Button size="small" onClick={applyTrusts}>Áp dụng</Button>
          </Paper>
          </Box>
        </Grid>

        {/* RIGHT COLUMN: List */}
        <Grid item xs={12} lg={10} sx={{ mx: { lg: 'auto' }, '@media (max-width:1112px)': { width: '100%' } }}>
      <Box component="main" sx={{ pl: 0, pr: { xs: 1, lg: 1.5 }, py: { xs: 1.2, lg: 1.6 }, ml: 0, maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Danh sách tìm người ở ghép
        </Typography>

        {/* Toolbar search + quick filters */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <ToggleButton value="filter" selected={openFilter} onClick={openFilterOverlay} sx={{ borderRadius: 2, px: 1.5 }}>
            <FilterAltOutlinedIcon />
          </ToggleButton>

          <ToggleButtonGroup value={sort} exclusive onChange={handleSortChange} size="small" sx={{ mr: 'auto' }}>
            <ToggleButton value="popular">Phổ biến</ToggleButton>
            <ToggleButton value="newest">Mới nhất</ToggleButton>
            <ToggleButton value="price" onClick={openPriceMenu}>Giá <ExpandMoreIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closePriceMenu}>
            <MenuItem onClick={() => { setSort('priceAsc'); closePriceMenu(); }}>Giá tăng dần</MenuItem>
            <MenuItem onClick={() => { setSort('priceDesc'); closePriceMenu(); }}>Giá giảm dần</MenuItem>
          </Menu>

          <TextField
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            size="small"
            placeholder="Search for..."
            sx={{ minWidth: { xs: 220, md: 240, lg: 260 }, bgcolor: '#eee', borderRadius: 5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Filter Overlay */}
        <Dialog open={openFilter} onClose={closeFilterOverlay} fullWidth maxWidth="md">
          <DialogTitle>Bộ lọc</DialogTitle>
          <DialogContent dividers>
            {/* Danh mục cho thuê */}
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Danh mục cho thuê</Typography>
            <Grid container spacing={1.2} sx={{ mb: 2 }}>
              {categoryOptions.map((c) => (
                <Grid item key={c}>
                  <Button variant={selectedCategory === c ? 'contained' : 'outlined'} size="small" onClick={() => setSelectedCategory(c)} sx={{ borderRadius: 3 }}>
                    {c}
                  </Button>
                </Grid>
              ))}
            </Grid>

            {/* Lọc theo khu vực */}
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Lọc theo khu vực</Typography>
            <Grid container spacing={1.5} sx={{ mb: 1 }}>
              <Grid item xs={12} md={4}>
                <Button fullWidth variant="outlined" sx={{ justifyContent: 'space-between' }} endIcon={<ExpandMoreIcon />} onClick={(e) => setProvinceEl(e.currentTarget)}>{selectedProvince}</Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button fullWidth variant="outlined" sx={{ justifyContent: 'space-between' }} endIcon={<ExpandMoreIcon />} onClick={(e) => setDistrictEl(e.currentTarget)}>{selectedDistrict}</Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button fullWidth variant="outlined" sx={{ justifyContent: 'space-between' }} endIcon={<ExpandMoreIcon />} onClick={(e) => setWardEl(e.currentTarget)}>{selectedWard}</Button>
              </Grid>
            </Grid>
            <Menu anchorEl={provinceEl} open={Boolean(provinceEl)} onClose={() => setProvinceEl(null)}>
              <MenuItem onClick={() => { setSelectedProvince('Toàn quốc'); setDistrictEl(null); setSelectedDistrict('Tất cả'); setSelectedWard('Tất cả'); setProvinceEl(null); }}>Toàn quốc</MenuItem>
              {provinceOptions.map((p) => (
                <MenuItem key={p} onClick={() => { setSelectedProvince(p); setSelectedDistrict('Tất cả'); setSelectedWard('Tất cả'); setProvinceEl(null); }}>{p}</MenuItem>
              ))}
            </Menu>
            <Menu anchorEl={districtEl} open={Boolean(districtEl)} onClose={() => setDistrictEl(null)}>
              <MenuItem onClick={() => { setSelectedDistrict('Tất cả'); setSelectedWard('Tất cả'); setDistrictEl(null); }}>Tất cả</MenuItem>
              {districtOptions.map((d) => (
                <MenuItem key={d} onClick={() => { setSelectedDistrict(d); setSelectedWard('Tất cả'); setDistrictEl(null); }}>{d}</MenuItem>
              ))}
            </Menu>
            <Menu anchorEl={wardEl} open={Boolean(wardEl)} onClose={() => setWardEl(null)}>
              <MenuItem onClick={() => { setSelectedWard('Tất cả'); setWardEl(null); }}>Tất cả</MenuItem>
              {wardOptions.map((w) => (
                <MenuItem key={w} onClick={() => { setSelectedWard(w); setWardEl(null); }}>{w}</MenuItem>
              ))}
            </Menu>

            {/* Khoảng giá - buttons preset + slider */}
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Khoảng giá</Typography>
            <Grid container spacing={1} sx={{ mb: 1.5 }}>
              {pricePresets.map((p) => (
                <Grid item key={p.key}>
                  <Button size="small" variant={selectedPriceKey === p.key ? 'contained' : 'outlined'} onClick={() => { setSelectedPriceKey(p.key); setDraftPrice(p.range); }} sx={{ borderRadius: 3 }}>
                    {p.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
            <Slider value={draftPrice} onChange={(_, v) => setDraftPrice(v)} min={0} max={20} step={0.5} valueLabelDisplay="auto" valueLabelFormat={(v) => `${v}tr`} />

            {/* Đặc điểm nổi bật */}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Đặc điểm nổi bật</Typography>
            <Grid container spacing={1}>
              {featureOptions.map((f) => (
                <Grid item key={f}>
                  <Button size="small" variant={selectedFeatures.includes(f) ? 'contained' : 'outlined'} onClick={() => setSelectedFeatures((prev) => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])} sx={{ borderRadius: 3 }}>
                    {f}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button color="secondary" onClick={clearAllFilters}>Xóa tất cả bộ lọc</Button>
            <Button onClick={closeFilterOverlay}>Đóng</Button>
            <Button variant="contained" onClick={() => { applyPrice(); applyArea(); applyTypes(); setPage(1); closeFilterOverlay(); }}>Áp dụng</Button>
          </DialogActions>
        </Dialog>
        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
          <Chip label={`Tổng: ${filteredRooms.length}`} />
          {filters.types.map((t) => (
            <Chip key={t} color="primary" label={t} />
          ))}
          <Chip label={`≤ ${filters.price[1]}tr`} />
          <Chip label={`≤ ${filters.area[1]}m²`} />
        </Stack>

        <Stack spacing={1.2}>
          {currentItems.map((room) => (
            <Paper key={room.id} variant="outlined" sx={{ p: 1.6, borderRadius: 2, minHeight: 160 }}>
              <Grid container spacing={0.8} alignItems="flex-start" sx={{ flexWrap: 'nowrap' }}>
                <Grid item xs sx={{ display: 'flex', flex: '0 0 auto' }}>
                  <Box sx={{ position: 'relative', height: 170, width: 240, overflow: 'hidden', borderRadius: 1.2, bgcolor: '#f0f0f0', alignSelf: 'stretch', flexShrink: 0 }}>
                    {/* Khung ảnh cố định: mọi ảnh lấp đầy khung, không thay đổi kích thước thẻ */}
                    <Box component="img" src={room.image} alt={room.title} sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: '100%', minHeight: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block' }} />
                    <Box sx={{ position: 'absolute', bottom: 6, left: 6, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', px: 1, py: 0.2, borderRadius: 1, fontSize: 12 }}>
                      {Array.isArray(room.images) ? room.images.length : 1} ảnh
                    </Box>
                    <Tooltip title={favorites.has(room.id) ? 'Bỏ yêu thích' : 'Yêu thích'}>
                      <IconButton onClick={() => toggleFavorite(room.id)} size="medium" sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(255,255,255,0.9)' }}>
                        {favorites.has(room.id) ? <FavoriteIcon color="error" fontSize="medium" /> : <FavoriteBorderIcon fontSize="medium" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
                <Grid item xs sx={{ display: 'flex', minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, height: '100%', alignSelf: 'stretch' }}>
                    <Box sx={{ flex: 1, pl: { xs: 0, sm: 1 }, minWidth: 0 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.4, fontSize: { md: 16, lg: 16 } }}>
                        {room.title}
                      </Typography>
                      <Stack direction="row" spacing={1.4} sx={{ mb: 0.5, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="error.main" sx={{ fontWeight: 700 }}>
                          {room.price} {room.unit}
                        </Typography>
                        <Typography variant="body2">{room.area} m²</Typography>
                        <Typography variant="body2">{room.beds || 0}pn</Typography>
                        <Typography variant="body2">{room.baths || 0}wc</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.8} sx={{ mb: 0.5, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">{room.district}</Typography>
                        <Typography variant="body2" color="text.secondary">,</Typography>
                        <Typography variant="body2" color="text.secondary">{room.city}</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 12.5, pr: { md: 2 } }}>
                        {room.description}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 'auto', alignItems: 'center' }}>
                        <Chip size="small" label={room.roomType} />
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => handleViewDetails(room.id, room.postId)}
                          sx={{ 
                            ml: 'auto',
                            textTransform: 'none',
                            fontSize: '12px',
                            minWidth: 'auto',
                            px: 2
                          }}
                        >
                          Xem chi tiết
                        </Button>
                        <Box sx={{ flexGrow: 1 }} />
                        {/* Người đăng: góc phải dưới, ngang hàng nút */}
                        <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
                          <Box sx={{ width: 24, height: 24, bgcolor: '#ff6f00', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                            {room.author?.charAt(0) || 'N'}
                          </Box>
                          <Typography variant="caption" color="text.secondary">{room.author}</Typography>
                        </Stack>
                      </Stack>
                      {/* Ẩn ngày đăng để card không bị kéo cao */}
                    </Box>
                    <Box sx={{ minWidth: 130, textAlign: 'right' }}>
                      {/* Người đăng đã được chuyển xuống dưới nút ở cột trái */}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" shape="rounded" />
        </Box>
      </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InviteRooms;
