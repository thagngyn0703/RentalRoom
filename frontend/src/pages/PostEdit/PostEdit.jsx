import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  useTheme,
  TextField,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  fetchPostByIdAction,
  updatePostAction,
  uploadFiles,
} from "../../services/api/postApi";
import axiosJWT from '../../config/axiosJWT';
import SelectLocation from "../UserLayout/component/selectLocation";
import BasicInfoSection from "../UserLayout/component/BasicInfoSection";
import UtilitiesSection from "../UserLayout/component/UtilitiesSection";
import CostsSection from "../UserLayout/component/CostsSection";
import HouseRulesSection from "../UserLayout/component/HouseRulesSection";
import MediaEditSection from "../UserLayout/component/MediaEditSection";
import { useToast } from '../../Components/ToastProvider';

const PostEdit = () => {
  const theme = useTheme();
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  // Ở trang chỉnh sửa trong khu vực `/user/posts`:
  // không hiển thị và không cho phép chỉnh sửa video.
  const hideVideoSection = true;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [post, setPost] = useState(null);

  // Form state mirrors PostRoomPages
  const [title, setTitle] = useState("");
  const [overviewDescription, setOverviewDescription] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    priceFrom: "",
    priceTo: "",
    area: "",
    beds: 0,
    baths: 0,
    province: "",
    district: "",
    ward: "",
    street: "",
  });

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [address, setAddress] = useState("");
  const [nameLocation, setNameLocation] = useState({
    provinceName: "",
    districtName: "",
    wardName: "",
  });

  const [selectedUtilities, setSelectedUtilities] = useState([]);
  const [additionalCosts, setAdditionalCosts] = useState([]);
  const [postTier, setPostTier] = useState('normal');
  const [newCost, setNewCost] = useState({ type: "", frequency: "" });
  const [houseRules, setHouseRules] = useState("");

  // helper to map room.roomType or stored values to select option values used in BasicInfoSection
  const mapRoomTypeToCategory = (rt) => {
    if (!rt) return '';
    const s = String(rt).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    if (s.includes('phong') || s.includes('phong tro') || s.includes('phong-tro') || s.includes('phongtro')) return 'phong-tro';
    if (s.includes('nha-nguyen') || s.includes('nguyen-can') || s.includes('nguyen can') || s.includes('nhanguyen')) return 'nha-nguyen-can';
    if (s.includes('nha') || s.includes('nha-tro') || s.includes('nhatro')) return 'nha-tro';
    return '';
  };

  // media local file lists and url lists
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [imagesUrls, setImagesUrls] = useState([]);
  const [videosUrls, setVideosUrls] = useState([]);
  const [stagedDeletes, setStagedDeletes] = useState([]); // { type, url, public_id, resource_type }

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const p = await fetchPostByIdAction(postId, dispatch);
        if (!mounted) return;
        if (!p) {
          showToast('Không tìm thấy bài đăng', 'error');
          setPost(null);
          return;
        }
        setPost(p);

        // prefill form state with post data
        setTitle(p.title || "");
        setOverviewDescription(p.overviewDescription || "");
        setFilters(prev => ({
          ...prev,
          category: p.category || mapRoomTypeToCategory(p.room?.roomType) || prev.category,
          priceFrom: (p.priceFrom ?? (p.room?.price)) || prev.priceFrom,
          area: (p.area ?? (p.room?.area)) || prev.area,
          beds: (p.room?.beds ?? 0),
          baths: (p.room?.baths ?? 0),
        }));

        // location
        setSelectedProvince(p.room?.province || "");
        setSelectedDistrict(p.room?.district || "");
        setAddress(p.room?.detailAddress || p.room?.address || "");
        setNameLocation(prev => ({
          ...prev,
          provinceName: p.room?.province || prev.provinceName,
          districtName: p.room?.district || prev.districtName,
          wardName: p.room?.ward || prev.wardName,
        }));

  // utilities/additionalCosts may be stored on post or on the linked room
  const rawUtils = Array.isArray(p.utilities) ? p.utilities : (Array.isArray(p.room?.utilities) ? p.room.utilities : []);
  // normalize utilities to an array of strings (support string items or { name/type } objects)
  const normalizedUtils = Array.isArray(rawUtils) ? rawUtils.map(u => (typeof u === 'string' ? u : (u.name || u.type || u.label || ''))).filter(Boolean) : [];
  setSelectedUtilities(normalizedUtils);

  const rawCosts = Array.isArray(p.additionalCosts) ? p.additionalCosts : (Array.isArray(p.room?.additionalCosts) ? p.room.additionalCosts : []);
  // normalize additionalCosts to include an `id` used by the UI list (avoid empty keys)
  const normalizedCosts = Array.isArray(rawCosts) ? rawCosts.map((c, i) => ({ id: c.id || (`ac_${Date.now()}_${i}`), type: c.type || c.name || '', frequency: c.frequency || c.freq || '' })) : [];
  setAdditionalCosts(normalizedCosts);
        setHouseRules(p.houseRules || "");

        // images/videos: show existing urls in lists so user can remove/add
  setImagesUrls(Array.isArray(p.images) ? p.images : (Array.isArray(p.room?.images) ? p.room.images : []));
        setVideosUrls(Array.isArray(p.videos) ? p.videos : []);
  setPostTier(p.postTier || 'normal');

      } catch (err) {
        console.error('Load post error', err);
        showToast('Lỗi khi tải dữ liệu bài đăng', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [postId, dispatch, showToast]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleUtilityChange = (utility) => {
    setSelectedUtilities(prev =>
      prev.includes(utility) ? prev.filter(i => i !== utility) : [...prev, utility]
    );
  };

  const handleAddCost = () => {
    if (newCost.type && newCost.frequency) {
      setAdditionalCosts(prev => [...prev, { ...newCost, id: Date.now() }]);
      setNewCost({ type: "", frequency: "" });
    }
  };

  const handleRemoveCost = (id) => {
    setAdditionalCosts(prev => prev.filter(cost => cost.id !== id));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length + uploadedImages.length > 15) {
      alert('Tối đa 15 ảnh với tin đăng.');
      return;
    }
    console.log('handleImageUpload selected files', files.map(f=>f.name));
    setUploadedImages(prev => [...prev, ...files]);
  };

  const handleVideoUpload = (event) => {
    if (hideVideoSection) {
      showToast('Không cho phép upload/chỉnh sửa video ở trang này.', 'warning');
      return;
    }
    const files = Array.from(event.target.files || []);
    if (files.length + uploadedVideos.length > 2) {
      alert('Tối đa 2 video với tin đăng');
      return;
    }
    console.log('handleVideoUpload selected files', files.map(f=>f.name));
    setUploadedVideos(prev => [...prev, ...files]);
  };

  // source: 'existing' for URLs currently stored on the post, 'new' for freshly selected File objects
  const removeImage = (index, type, source = 'new') => {
    const urlToRemove = (type === 'images') ? imagesUrls[index] : (type === 'videos' ? videosUrls[index] : null);
    // helper to derive probable public_id from cloudinary URL
    const urlToId = (url) => {
      try {
        const u = url.split('?')[0]; // strip query
        const parts = u.split('/');
        const uploadIdx = parts.findIndex(p => p === 'upload');
        if (uploadIdx === -1) return null;
        let remainder = parts.slice(uploadIdx + 1).join('/');
        remainder = remainder.replace(/^v\d+\//, '');
        const dot = remainder.lastIndexOf('.');
        if (dot !== -1) remainder = remainder.substring(0, dot);
        return remainder;
      } catch (e) {
        return null;
      }
    };

    if (source === 'existing' && urlToRemove) {
      const public_id = urlToId(urlToRemove);
      const resource_type = (type === 'videos') ? 'video' : 'image';
      // Stage for deletion on save
      setStagedDeletes(prev => [...prev, { type, url: urlToRemove, public_id, resource_type }]);
      showToast('Đã đánh dấu tài nguyên để xóa khi nhấn Lưu', 'info');
      // remove from UI lists immediately
      if (type === 'images') setImagesUrls(prev => prev.filter((_, i) => i !== index));
      else if (type === 'videos') setVideosUrls(prev => prev.filter((_, i) => i !== index));
      // if public_id couldn't be derived, warn user we'll attempt best-effort delete on save
      if (!public_id) showToast('Không xác định được public_id từ URL. Hệ thống sẽ cố gắng tìm và xóa khi lưu.', 'warning');
    } else {
      // removing newly selected local files -- just remove from local arrays
      if (type === 'images') setUploadedImages(prev => prev.filter((_, i) => i !== index));
      else if (type === 'videos') setUploadedVideos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    // Basic validation similar to PostRoomPages
    const missing = [];
    if (!title || !title.trim()) missing.push('Tiêu đề');
    if (!overviewDescription || !overviewDescription.trim()) missing.push('Mô tả');
    if (!filters.category) missing.push('Loại phòng');
    if (!filters.priceFrom && !filters.priceTo && !imagesUrls.length) {
      // not strict: allow updates without price if user intends
    }
    if (!(nameLocation?.provinceName) && !selectedProvince) missing.push('Tỉnh/Thành');
    if (!(nameLocation?.districtName) && !selectedDistrict) missing.push('Quận/Huyện');
    if (!address || !address.trim()) missing.push('Địa chỉ chi tiết');
    if (missing.length) {
      showToast('Vui lòng điền các trường bắt buộc: ' + missing.join(', '), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // upload selected local files and merge with existing URLs
      let finalImageUrls = Array.isArray(imagesUrls) ? [...imagesUrls] : [];
      let finalVideoUrls = Array.isArray(videosUrls) ? [...videosUrls] : [];

      console.log('Preparing to upload files:', {
        uploadedImages: Array.isArray(uploadedImages) ? uploadedImages.length : 0,
        uploadedVideos: Array.isArray(uploadedVideos) ? uploadedVideos.length : 0,
      });

      if (Array.isArray(uploadedImages) && uploadedImages.length) {
        console.log('Uploading images (edit)... count=', uploadedImages.length);
        showToast('Đang upload ảnh...', 'info');
        try {
          const urls = await uploadFiles(uploadedImages, 'posts/media', 3);
          console.log('Uploaded images urls', urls);
          finalImageUrls = [...finalImageUrls, ...urls];
        } catch (e) {
          console.error('Upload images failed', e);
          showToast('Upload ảnh thất bại: ' + (e?.message || ''), 'error');
        }
      }

      if (!hideVideoSection && Array.isArray(uploadedVideos) && uploadedVideos.length) {
        console.log('Uploading videos (edit)... count=', uploadedVideos.length);
        showToast('Đang upload video...', 'info');
        try {
          const urls = await uploadFiles(uploadedVideos, 'posts/media', 2);
          console.log('Uploaded videos urls', urls);
          finalVideoUrls = [...finalVideoUrls, ...urls];
        } catch (e) {
          console.error('Upload videos failed', e);
          showToast('Upload video thất bại: ' + (e?.message || ''), 'error');
        }
      }

      // prepare room-scoped fields (backend.updatePost expects room fields under `room` key)
      const additionalCostsToSave = Array.isArray(additionalCosts) ? additionalCosts.map(c => ({ type: c.type || '', frequency: c.frequency || '' })) : [];
      const utilitiesToSave = Array.isArray(selectedUtilities) ? selectedUtilities : [];

      const payload = {
        title,
        overviewDescription,
        postType: post?.postType || 'room_rental',
        postTier,
        category: filters.category,
        priceFrom: filters.priceFrom,
        priceTo: filters.priceTo,
        area: filters.area,
        // keep top-level copies for compatibility, but backend.updatePost updates room fields from `room`
        utilities: selectedUtilities,
        additionalCosts,
        houseRules,
        images: finalImageUrls,
        videos: finalVideoUrls,
        room: {
          price: Number(filters.priceFrom) || (post?.room?.price || 0),
          area: Number(filters.area) || (post?.room?.area || 0),
          beds: Number(filters.beds) || 0,
          baths: Number(filters.baths) || 0,
          roomType: filters.category || post?.room?.roomType || '',
          district: nameLocation.districtName || post?.room?.district || '',
          province: nameLocation.provinceName || post?.room?.province || '',
          detailAddress: address || post?.room?.detailAddress || '',
          utilities: utilitiesToSave,
          additionalCosts: additionalCostsToSave,
        },
      };

      const res = await updatePostAction(postId, payload, dispatch);
      if (res?.error) {
        showToast('Cập nhật thất bại', 'error');
      } else {
        // After DB updated, perform staged Cloudinary deletions (best-effort)
        if (Array.isArray(stagedDeletes) && stagedDeletes.length) {
          const deleteResults = [];
          for (const item of stagedDeletes) {
            const pid = item.public_id || (function(url){ try { const u = url.split('?')[0]; const parts = u.split('/'); const uploadIdx = parts.findIndex(p => p === 'upload'); if (uploadIdx === -1) return null; let remainder = parts.slice(uploadIdx + 1).join('/'); remainder = remainder.replace(/^v\d+\//, ''); const dot = remainder.lastIndexOf('.'); if (dot !== -1) remainder = remainder.substring(0, dot); return remainder; } catch(e) { return null; } })(item.url);
            if (!pid) {
              deleteResults.push({ ok: false, item, error: 'no-public-id' });
              continue;
            }
            try {
              await axiosJWT.post('/api/cloudinary/delete', { public_id: pid, resource_type: item.resource_type });
              deleteResults.push({ ok: true, item });
            } catch (e) {
              deleteResults.push({ ok: false, item, error: e });
            }
          }
          const failed = deleteResults.filter(r => !r.ok);
          if (failed.length) {
            console.warn('Some staged deletes failed', failed);
            showToast(`Một số tài nguyên chưa xóa được trên Cloudinary: ${failed.length}`, 'warning');
          } else {
            showToast('Tất cả tài nguyên đã xóa trên Cloudinary', 'success');
          }
          // clear staged deletes after attempting
          setStagedDeletes([]);
        }

  showToast('Cập nhật thành công', 'success');
  // Do not navigate away — reload the current page so the user stays on the edit view
  // and sees updated content. This preserves the requested UX: show success then reload.
  window.location.reload();
      }
    } catch (err) {
      console.error('Submit edit error', err);
      showToast('Có lỗi khi lưu bài đăng', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Typography>Đang tải...</Typography>;
  if (!post) return <Typography color="error">Không tìm thấy bài đăng</Typography>;

  return (
    <Box
      className="invite-roommate-content"
      sx={{ minHeight: "100vh", backgroundColor: "#fff", p: 2, width: "100%" }}
    >
      <Box sx={{ mb: 4, textAlign: "left" }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: "bold", color: theme.palette.primary.main, mb: 1, textAlign: "left" }}
        >
          Chỉnh sửa bài đăng
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={12}>
          <Grid size={{ xs: 12, sm: 10, md: 8, lg: 8 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" mb={1} sx={{ textAlign: "left" }}>
                Tiêu đề
              </Typography>
              <TextField fullWidth size="small" placeholder="Tiêu đề bài đăng " value={title} onChange={(e) => setTitle(e.target.value)} sx={{ bgcolor: "#fff" }} />
                <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ minWidth: 80 }}>Phân loại</Typography>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <Select value={postTier} onChange={(e) => setPostTier(e.target.value)}>
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="vip">VIP</MenuItem>
                      <MenuItem value="svip">S-VIP</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" mb={1} sx={{ textAlign: "left" }}>
                Mô tả chung
              </Typography>
              <TextField fullWidth size="small" placeholder="Mô tả ngắn tối đa 200 ký tự" value={overviewDescription} onChange={(e) => setOverviewDescription(e.target.value)} sx={{ bgcolor: "#fff", mt: 1 }} inputProps={{ maxLength: 200 }} />
            </Box>
          </Grid>

          <BasicInfoSection selectedCategory={filters.category} setSelectedCategory={(v) => handleFilterChange('category', v)} selectedPrice={filters.priceFrom} setSelectedPrice={(v) => handleFilterChange('priceFrom', v)} selectedArea={filters.area} setSelectedArea={(v) => handleFilterChange('area', v)} selectedBeds={filters.beds} setSelectedBeds={(v) => handleFilterChange('beds', v)} selectedBaths={filters.baths} setSelectedBaths={(v) => handleFilterChange('baths', v)} />

          <SelectLocation selectedProvince={selectedProvince} setSelectedProvince={setSelectedProvince} selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict} selectedWard={selectedWard} setSelectedWard={setSelectedWard} address={address} setAddress={setAddress} setNameLocation={setNameLocation} nameLocation={nameLocation} />

          <UtilitiesSection selectedUtilities={selectedUtilities} handleUtilityChange={handleUtilityChange} />

          <CostsSection additionalCosts={additionalCosts} newCost={newCost} setNewCost={setNewCost} handleAddCost={handleAddCost} handleRemoveCost={handleRemoveCost} />

          <HouseRulesSection houseRules={houseRules} setHouseRules={setHouseRules} />

          <MediaEditSection
            imagesUrls={imagesUrls}
            videosUrls={videosUrls}
            uploadedImages={uploadedImages}
            uploadedVideos={uploadedVideos}
            handleImageUpload={handleImageUpload}
            handleVideoUpload={handleVideoUpload}
            removeImage={removeImage}
            disabled={isSubmitting}
            hideVideoSection={hideVideoSection}
          />

          {/* Staged deletes list with undo */}
          {Array.isArray(stagedDeletes) && stagedDeletes.length > 0 && (
            <Box sx={{ mb: 2, p: 2, border: '1px dashed #ccc', borderRadius: 1, bgcolor: '#fff8e1' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Các mục sẽ bị xóa khi lưu (có thể hoàn tác)</Typography>
              <Grid container spacing={1}>
                {stagedDeletes.map((it, idx) => (
                  <Grid item key={`staged-${idx}`} xs={12} sm={6} md={4} lg={3}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Box sx={{ width: 80, height: 60, border: '1px solid #ddd', overflow: 'hidden', borderRadius: 1 }}>
                        {it.url ? <img src={it.url} alt={`staged-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Box sx={{ p: 1 }}>No preview</Box>}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{it.type}</Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>{it.public_id ? it.public_id : '(no public_id)'}</Typography>
                      </Box>
                      <Box>
                        <Button size="small" variant="outlined" onClick={() => {
                          // undo: remove from stagedDeletes and restore into the appropriate list
                          setStagedDeletes(prev => prev.filter((_, i) => i !== idx));
                          if (it.type === 'images') setImagesUrls(prev => [...prev, it.url]);
                          else if (it.type === 'videos') setVideosUrls(prev => [...prev, it.url]);
                        }} disabled={isSubmitting}>Hoàn tác</Button>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button variant="contained" color="primary" size="large" onClick={handleSubmit} disabled={isSubmitting} sx={{ px: 6, py: 1.5, fontSize: "1.1rem", fontWeight: "bold" }}>
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PostEdit;
