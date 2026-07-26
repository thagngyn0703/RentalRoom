import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  TextField,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosJWT from '../../../config/axiosJWT';
import { uploadFiles } from '../../../services/api/postApi';

export default function RoomEditModal({ open, onClose, roomId, onUpdateSuccess }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    roomType: '',
    price: '',
    area: '',
    beds: 0,
    baths: 0,
    province: '',
    district: '',
    ward: '',
    address: '',
    utilities: [],
    notes: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const utilityOptions = [
    'Wifi', 'Điều hòa', 'Máy giặt', 'Tủ lạnh', 'Nóng lạnh', 'Thang máy', 'Bãi gửi xe', 'Ban công', 'Bếp riêng', 'Giường', 'Tủ đồ', 'Camera an ninh'
  ];

  useEffect(() => {
    if (open && roomId) {
      fetchRoomDetail();
    }
  }, [open, roomId]);

  const fetchRoomDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosJWT.get(`/api/rooms/${roomId}`);
      const roomData = res.data;
      setRoom(roomData);
      setFormData({
        roomType: roomData.roomType || '',
        price: roomData.price || '',
        area: roomData.area || '',
        beds: roomData.beds || 0,
        baths: roomData.baths || 0,
        province: roomData.province || '',
        district: roomData.district || '',
        ward: roomData.ward || '',
        address: roomData.address || '',
        utilities: roomData.utilities || [],
        notes: roomData.notes || ''
      });
      // set previews from existing image URLs
      setImagePreviews(roomData.images || (roomData.post && roomData.post.images) || []);
    } catch (err) {
      console.error('Lỗi khi tải chi tiết phòng:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Không thể tải chi tiết phòng');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUtilityChange = (utility) => {
    setFormData(prev => {
      const exists = prev.utilities.includes(utility);
      return {
        ...prev,
        utilities: exists
          ? prev.utilities.filter(u => u !== utility)
          : [...prev.utilities, utility]
      };
    });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    // revoke previous blob urls
    (imagePreviews || []).forEach(u => { if (typeof u === 'string' && u.startsWith('blob:')) URL.revokeObjectURL(u); });
    setImageFiles(files);
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  // cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      (imagePreviews || []).forEach(u => { if (typeof u === 'string' && u.startsWith('blob:')) URL.revokeObjectURL(u); });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      // If new image files selected, upload them first and set formData.images
      const payload = { ...formData };
      if (imageFiles && imageFiles.length) {
        try {
          const urls = await uploadFiles(imageFiles, 'posts/media', 3);
          payload.images = urls;
        } catch (upErr) {
          console.error('Upload images failed:', upErr);
          throw upErr;
        }
      }
      const res = await axiosJWT.patch(`/api/rooms/${roomId}`, payload);
      alert('Cập nhật phòng thành công!');
      setRoom(res.data);
      onUpdateSuccess && onUpdateSuccess();
      onClose();
    } catch (err) {
      console.error('Lỗi khi cập nhật phòng:', err.response?.data || err.message);
      const errMsg = err.response?.data?.error || 'Lỗi khi cập nhật phòng';
      setError(errMsg);
      alert(`Lỗi: ${errMsg}`);
    }
    setSubmitting(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cập nhật thông tin phòng</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main', mt: 2 }}>
              Thông tin bắt buộc
            </Typography>
            
            <TextField
              label="Loại phòng"
              name="roomType"
              value={formData.roomType}
              onChange={handleInputChange}
              fullWidth
              select
              sx={{ my: 1 }}
            >
              <MenuItem value="Phòng trọ">Phòng trọ</MenuItem>
              <MenuItem value="Căn hộ">Căn hộ</MenuItem>
              <MenuItem value="Ký túc xá">Ký túc xá</MenuItem>
            </TextField>

            <TextField
              label="Giá"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              fullWidth
              sx={{ my: 1 }}
              type="number"
              InputProps={{ endAdornment: <span>VND</span> }}
            />

            <TextField
              label="Diện tích (m²)"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              fullWidth
              sx={{ my: 1 }}
              type="number"
            />

            <TextField
              label="Tỉnh/Thành"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              fullWidth
              sx={{ my: 1 }}
            />

            <TextField
              label="Quận/Huyện"
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              fullWidth
              sx={{ my: 1 }}
            />

            <TextField
              label="Địa chỉ chi tiết"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              fullWidth
              sx={{ my: 1 }}
            />

            <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main', mt: 2 }}>
              Thông tin bổ sung
            </Typography>

            <TextField
              label="Phường/Xã"
              name="ward"
              value={formData.ward}
              onChange={handleInputChange}
              fullWidth
              sx={{ my: 1 }}
            />

            <TextField
              label="Số phòng ngủ"
              name="beds"
              value={formData.beds}
              onChange={handleInputChange}
              fullWidth
              sx={{ my: 1 }}
              type="number"
            />

            <TextField
              label="Số phòng WC"
              name="baths"
              value={formData.baths}
              onChange={handleInputChange}
              fullWidth
              sx={{ my: 1 }}
              type="number"
            />

            <Box sx={{ my: 2 }}>
              <Typography fontSize={14} sx={{ mb: 1 }}>Tiện ích</Typography>
              <FormGroup row>
                {utilityOptions.map(option => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={formData.utilities.includes(option)}
                        onChange={() => handleUtilityChange(option)}
                      />
                    }
                    label={option}
                  />
                ))}
              </FormGroup>
            </Box>

            <Box sx={{ my: 2 }}>
              <Typography fontSize={14} sx={{ mb: 1 }}>Ảnh (chọn ảnh mới để thay thế)</Typography>
              <input
                id="room-edit-images"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleImageSelect}
              />
              <label htmlFor="room-edit-images">
                <Button component="span" variant="outlined">Chọn ảnh</Button>
              </label>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {imagePreviews && imagePreviews.length ? (
                  imagePreviews.map((p, i) => (
                    <Box key={i} sx={{ position: 'relative' }}>
                      <img src={p} alt={`preview-${i}`} style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 6 }} />
                      <IconButton size="small" onClick={() => { setImageFiles([]); setImagePreviews([]); }} sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)' }}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">Chưa có ảnh</Typography>
                )}
              </Box>
            </Box>

            <TextField
              label="Ghi chú"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              fullWidth
              sx={{ my: 1 }}
              multiline
              minRows={2}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || submitting}
        >
          {submitting ? <CircularProgress size={20} /> : 'Cập nhật'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
