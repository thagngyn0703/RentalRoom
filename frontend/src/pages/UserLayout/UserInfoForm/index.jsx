import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';

import Grid from '@mui/material/Grid';
import { 
  Person as PersonIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { getUserInfor, updateUserInfor } from '../../../services/api/userInforApi';
import { uploadFiles } from '../../../services/api/postApi';
import InterestsSection from './components/InterestsSection';
import HabitsSection from './components/HabitsSection';
import DislikesSection from './components/DislikesSection';

const UserInfoForms = () => {
  // debug token visual removed for cleaner UI
  const theme = useTheme();
  const dispatch = useDispatch();
  // Redux selectors
  const userInforData = useSelector((state) => state.userInfor.userInfor.dataInfor);
  const loading = useSelector((state) => state.userInfor.userInfor.isFetching);
  const message = useSelector((state) => state.userInfor.message);
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  // accessToken debug removed
  
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    profession: '',
    interests: [],
    habits: [],
    dislikes: [],
    bio: '',
    phoneNumber: '',
    avatar: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const prevPreviewRef = useRef(null);
  // local state for previously fetched data removed — we rely on Redux `userInforData`

  // Load user info on component mount
  useEffect(() => {
    const currentUserId = currentUser?.id || currentUser?._id;
    if (currentUserId) {
      // call the API and let the redux slice store the result
      (async () => {
        try {
          await getUserInfor(currentUserId, dispatch);
        } catch (e) {
          console.error('Failed to fetch user info on mount', e);
        }
      })();
    }
  }, [currentUser, dispatch]);

  // Update formData when userInforData changes
  useEffect(() => {
    if (userInforData) {
      // Defensive: ensure array fields are arrays (backend might store as single string accidentally)
      const safeInterests = Array.isArray(userInforData.interests) ? userInforData.interests : (userInforData.interests ? [userInforData.interests] : []);
      const safeHabits = Array.isArray(userInforData.habits) ? userInforData.habits : (userInforData.habits ? [userInforData.habits] : []);
      const safeDislikes = Array.isArray(userInforData.dislikes) ? userInforData.dislikes : (userInforData.dislikes ? [userInforData.dislikes] : []);

      // debug log to help trace why items may not show
      console.debug('UserInfoForm: loaded userInforData', {
        fullName: userInforData.fullName,
        interests: safeInterests,
        habits: safeHabits,
        dislikes: safeDislikes
      });

      setFormData({
        fullName: userInforData.fullName || '',
        age: userInforData.age || '',
        gender: userInforData.gender || '',
        profession: userInforData.profession || '',
        interests: safeInterests,
        habits: safeHabits,
        dislikes: safeDislikes,
        bio: userInforData.bio || '',
        phoneNumber: userInforData.phoneNumber || '',
        avatar: userInforData.avatar || ''
      });
      // also set preview to existing avatar URL so Avatar shows it
      if (userInforData.avatar) setAvatarPreview(userInforData.avatar);
    }
  }, [userInforData]);

  // revoke preview object URL when avatarFile changes/unmount
  useEffect(() => {
    // revoke previous blob preview when a new one is set
    if (prevPreviewRef.current && prevPreviewRef.current.startsWith && prevPreviewRef.current.startsWith('blob:') && prevPreviewRef.current !== avatarPreview) {
      try { URL.revokeObjectURL(prevPreviewRef.current); } catch(e) {}
    }
    prevPreviewRef.current = avatarPreview;
    return () => {
      // on unmount revoke last preview if it was a blob
      try {
        if (prevPreviewRef.current && prevPreviewRef.current.startsWith && prevPreviewRef.current.startsWith('blob:')) URL.revokeObjectURL(prevPreviewRef.current);
      } catch (e) { /* ignore */ }
    };
  }, [avatarPreview, avatarFile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handlers for child components
  const handleUpdateInterests = (newInterests) => {
    setFormData(prev => ({
      ...prev,
      interests: newInterests
    }));
  };

  const handleUpdateHabits = (newHabits) => {
    setFormData(prev => ({
      ...prev,
      habits: newHabits
    }));
  };

  const handleUpdateDislikes = (newDislikes) => {
    setFormData(prev => ({
      ...prev,
      dislikes: newDislikes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let toSave = { ...formData };
      console.log('UserInfoForms: submitting, toSave=', toSave, 'avatarFile=', avatarFile);
      // if user selected a new avatar file, upload it first
      if (avatarFile) {
        setAvatarUploading(true);
        try {
          const urls = await uploadFiles([avatarFile], 'users/avatars', 1);
          if (Array.isArray(urls) && urls[0]) {
            toSave.avatar = urls[0];
          }
        } catch (err) {
          console.error('Avatar upload failed', err);
          // proceed without avatar change
        } finally {
          setAvatarUploading(false);
        }
      }
      await updateUserInfor(toSave, dispatch);
      console.log('UserInfoForms: updateUserInfor completed, refetching user info');
  // refetch to ensure store has the latest data (and network shows GET)
  const currentUserId = currentUser?.id || currentUser?._id;
  if (currentUserId) await getUserInfor(currentUserId, dispatch);
      // reset local avatarFile if uploaded
      if (avatarFile) setAvatarFile(null);
    } catch (e) {
      console.error('Update user info failed', e);
    }
  };

  // token debug removed

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 1200, p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Thông tin cá nhân</Typography>
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Grid container spacing={3} alignItems="start">
            {/* Left: Avatar + upload (on small screens full width) */}
            <Grid item xs={12} md={5}>
              <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
                <Avatar sx={{ width: 140, height: 140, mx: 'auto', mb: 2, fontSize: '2.5rem' }} src={avatarPreview || formData.avatar}>
                  {!avatarPreview && !formData.avatar && (formData.fullName ? formData.fullName[0] : <PersonIcon fontSize="inherit" />)}
                </Avatar>
                <Button variant="outlined" component="label" startIcon={<PhotoCameraIcon />} sx={{ textTransform: 'none' }}>
                  Đổi ảnh
                  <input type="file" hidden accept="image/*" onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    if (!f) return;
                    if (f.size > 2 * 1024 * 1024) { // 2MB
                      alert('Kích thước ảnh không được vượt quá 2MB');
                      return;
                    }
                    setAvatarFile(f);
                    try {
                      const url = URL.createObjectURL(f);
                      setAvatarPreview(url);
                    } catch (err) {
                      console.error('Preview error', err);
                    }
                  }} />
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>Kích thước tối đa 2MB. JPG/PNG</Typography>
              </Box>
            </Grid>

            {/* Right: form fields */}
            <Grid item xs={12} md={7}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Tuổi"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Giới tính</InputLabel>
                    <Select
                      value={formData.gender}
                      label="Giới tính"
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                    >
                      <MenuItem value="Nam">Nam</MenuItem>
                      <MenuItem value="Nữ">Nữ</MenuItem>
                      <MenuItem value="Khác">Khác</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nghề nghiệp"
                    value={formData.profession}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Interests / Habits / Dislikes sections */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <InterestsSection
                    interests={formData.interests}
                    onUpdateInterests={handleUpdateInterests}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <HabitsSection
                    habits={formData.habits}
                    onUpdateHabits={handleUpdateHabits}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DislikesSection
                    dislikes={formData.dislikes}
                    onUpdateDislikes={handleUpdateDislikes}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Bio */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Giới thiệu bản thân"
                multiline
                rows={5}
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                helperText={`${formData.bio.length}/500 ký tự`}
              />
            </Grid>

            {/* Submit */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || avatarUploading}
                  startIcon={(loading || avatarUploading) ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.05rem',
                    borderRadius: 3,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                    '&:hover': { transform: 'translateY(-2px)' },
                    transition: 'all 200ms ease'
                  }}
                >
                  {loading || avatarUploading ? 'Đang lưu...' : 'Lưu thông tin'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserInfoForms;