import React from 'react';
import { Box, Typography, Grid, Button } from '@mui/material';

// MediaEditSection: render existing URLs (imagesUrls/videosUrls) and newly selected files (uploadedImages/uploadedVideos).
// removeImage(index, type, source) will be called with source = 'existing' | 'new'
const MediaEditSection = ({
  imagesUrls = [],
  videosUrls = [],
  uploadedImages = [],
  uploadedVideos = [],
  handleImageUpload,
  handleVideoUpload,
  removeImage,
  disabled = false,
  hideVideoSection = false,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" mb={1} sx={{ textAlign: 'left' }}>
        Hình ảnh/Video
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={10} md={8} lg={8}>
          {/* Images */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" mb={1} sx={{ fontWeight: 'medium' }}>Hình ảnh</Typography>
            <Typography variant="body2" mb={1} sx={{ color: '#666', fontSize: '0.8rem' }}>
              Tối đa 15 ảnh với tin đăng. Dung lượng không quá 6MB mỗi ảnh
            </Typography>

            <Grid container spacing={1}>
              <Grid item xs={6} sm={3} md={2} lg={2}>
                <Box component="label" sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  height: '120px', border: '2px dashed #00BCD4', borderRadius: 1, bgcolor: '#E0F7FA', cursor: 'pointer'
                }}>
                  <Box sx={{ fontSize: '24px', mb: 1 }}>+</Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Upload ảnh</Typography>
                  <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} disabled={disabled} />
                </Box>
              </Grid>

              {/* existing URLs */}
              {Array.isArray(imagesUrls) && imagesUrls.map((url, idx) => (
                <Grid item xs={6} sm={3} md={2} lg={2} key={`existing-img-${idx}`}>
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ height: '120px', border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                      <img src={url} alt={`img-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                    <Button size="small" color="error" onClick={() => removeImage(idx, 'images', 'existing')} disabled={disabled}
                      sx={{ position: 'absolute', top: -8, right: -8, minWidth: '24px', width: '24px', height: '24px', borderRadius: '50%', p: 0, bgcolor: 'white' }}>
                      ✕
                    </Button>
                  </Box>
                </Grid>
              ))}

              {/* newly selected files */}
              {uploadedImages.map((file, idx) => (
                <Grid item xs={6} sm={3} md={2} lg={2} key={`new-img-${idx}`}>
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ height: '120px', border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                      <img src={URL.createObjectURL(file)} alt={`new-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                    <Button size="small" color="error" onClick={() => removeImage(idx, 'images', 'new')} disabled={disabled}
                      sx={{ position: 'absolute', top: -8, right: -8, minWidth: '24px', width: '24px', height: '24px', borderRadius: '50%', p: 0, bgcolor: 'white' }}>
                      ✕
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Videos */}
          {!hideVideoSection && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" mb={1} sx={{ fontWeight: 'medium' }}>Video</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6} sm={3} md={2} lg={2}>
                  <Box component="label" sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    height: '120px', border: '2px dashed #00BCD4', borderRadius: 1, bgcolor: '#E0F7FA', cursor: 'pointer'
                  }}>
                    <Box sx={{ fontSize: '24px', mb: 1 }}>+</Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Upload video</Typography>
                    <input type="file" hidden multiple accept="video/*" onChange={handleVideoUpload} disabled={disabled} />
                  </Box>
                </Grid>

                {Array.isArray(videosUrls) && videosUrls.map((url, idx) => (
                  <Grid item xs={6} sm={3} md={2} lg={2} key={`existing-vid-${idx}`}>
                    <Box sx={{ position: 'relative' }}>
                      <Box sx={{ height: '120px', border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                        <video width="100%" height="100%" style={{ objectFit: 'cover' }} muted>
                          <source src={url} />
                        </video>
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.3)', color: 'white' }}>
                          <Box sx={{ fontSize: '24px' }}>▶️</Box>
                        </Box>
                      </Box>
                      <Button size="small" color="error" onClick={() => removeImage(idx, 'videos', 'existing')} disabled={disabled}
                        sx={{ position: 'absolute', top: -8, right: -8, minWidth: '24px', width: '24px', height: '24px', borderRadius: '50%', p: 0, bgcolor: 'white' }}>
                        ✕
                      </Button>
                    </Box>
                  </Grid>
                ))}

                {uploadedVideos.map((file, idx) => (
                  <Grid item xs={6} sm={3} md={2} lg={2} key={`new-vid-${idx}`}>
                    <Box sx={{ position: 'relative' }}>
                      <Box sx={{ height: '120px', border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                        <video width="100%" height="100%" style={{ objectFit: 'cover' }} muted>
                          <source src={URL.createObjectURL(file)} />
                        </video>
                      </Box>
                      <Button size="small" color="error" onClick={() => removeImage(idx, 'videos', 'new')} disabled={disabled}
                        sx={{ position: 'absolute', top: -8, right: -8, minWidth: '24px', width: '24px', height: '24px', borderRadius: '50%', p: 0, bgcolor: 'white' }}>
                        ✕
                      </Button>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default MediaEditSection;
