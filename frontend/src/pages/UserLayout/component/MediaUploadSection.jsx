import {
    Box,
    Typography,
    Grid,
    Button,
} from "@mui/material";
import React from "react";

const MediaUploadSection = ({ 
    uploadedImages,
    uploadedVideos = [],
    handleImageUpload,
    handleVideoUpload = () => {},
    removeImage,
    disabled = false,
    showVideo = true,
}) => {
    return (
        <Box sx={{ mb: 2 }}>
            <Typography
                variant="subtitle1"
                fontWeight="bold"
                mb={1}
                sx={{ textAlign: 'left' }}
            >
                {showVideo ? 'Hình ảnh/Video' : 'Hình ảnh'}
            </Typography>
            
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    {/* Hình ảnh */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" mb={1} sx={{ fontWeight: 'medium' }}>
                            Hình ảnh
                        </Typography>
                        <Typography variant="body2" mb={1} sx={{ color: '#666', fontSize: '0.8rem' }}>
                            Tối đa 15 ảnh với tin đăng. Dung lượng không quá 6MB mỗi ảnh
                        </Typography>
                        <Typography variant="body2" mb={2} sx={{ color: '#666', fontSize: '0.8rem' }}>
                            Thay đổi vị trí của ảnh bằng cách kéo ảnh vào vị trí mà bạn mong muốn
                        </Typography>
                        
                        <Grid container spacing={1}>
                        {/* Nút upload */}
                            <Grid item xs={6} sm={4} md={3} lg={2}>
                                <Box
                                    component="label"
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '120px',
                                        border: '2px dashed #00BCD4',
                                        borderRadius: 1,
                                        bgcolor: '#E0F7FA',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: '#B2EBF2'
                                        }
                                    }}
                                >
                                    <Box sx={{ fontSize: '24px', mb: 1 }}>+</Box>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        Upload ảnh
                                    </Typography>
                                    <input
                                        type="file"
                                        hidden
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={disabled}
                                    />
                                </Box>
                            </Grid>
                            
                            {/* Ảnh đã upload */}
                            {uploadedImages.map((image, index) => (
                                <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                                    <Box sx={{ position: 'relative' }}>
                                        <Box
                                            sx={{
                                                height: '120px',
                                                border: '1px solid #ddd',
                                                borderRadius: 1,
                                                overflow: 'hidden',
                                                bgcolor: '#f5f5f5'
                                            }}
                                        >
                                            {typeof image === 'string' ? (
                                                <img
                                                    src={image}
                                                    alt={`Preview ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : (
                                                <img
                                                    src={URL.createObjectURL(image)}
                                                    alt={`Preview ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => removeImage(index, 'images')}
                                            disabled={disabled}
                                            sx={{
                                                position: 'absolute',
                                                top: -8,
                                                right: -8,
                                                minWidth: '24px',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                p: 0,
                                                bgcolor: 'white',
                                                '&:hover': {
                                                    bgcolor: '#ffebee'
                                                }
                                            }}
                                        >
                                            ✕
                                        </Button>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    {showVideo && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" mb={1} sx={{ fontWeight: 'medium' }}>
                            Video
                        </Typography>
                        
                        <Grid container spacing={1}>
                            <Grid item xs={6} sm={4} md={3} lg={2}>
                                <Box
                                    component="label"
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '120px',
                                        border: '2px dashed #00BCD4',
                                        borderRadius: 1,
                                        bgcolor: '#E0F7FA',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: '#B2EBF2'
                                        }
                                    }}
                                >
                                    <Box sx={{ fontSize: '24px', mb: 1 }}>+</Box>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        Upload video
                                    </Typography>
                                    <input
                                        type="file"
                                        hidden
                                    multiple
                                    accept="video/*"
                                    onChange={handleVideoUpload}
                                    disabled={disabled}
                                    />
                                </Box>
                            </Grid>
                            
                            {uploadedVideos.map((video, index) => (
                                <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                                    <Box sx={{ position: 'relative' }}>
                                        <Box
                                            sx={{
                                                height: '120px',
                                                border: '1px solid #ddd',
                                                borderRadius: 1,
                                                overflow: 'hidden',
                                                bgcolor: '#f5f5f5'
                                            }}
                                        >
                                            {typeof video === 'string' ? (
                                                <video
                                                    width="100%"
                                                    height="100%"
                                                    style={{ objectFit: 'cover' }}
                                                    controls={false}
                                                    muted
                                                >
                                                    <source src={video} />
                                                </video>
                                            ) : (
                                                <video
                                                    width="100%"
                                                    height="100%"
                                                    style={{ objectFit: 'cover' }}
                                                    controls={false}
                                                    muted
                                                >
                                                    <source src={URL.createObjectURL(video)} />
                                                </video>
                                            )}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: 'rgba(0,0,0,0.3)',
                                                    color: 'white'
                                                }}
                                            >
                                                <Box sx={{ fontSize: '24px' }}>▶️</Box>
                                            </Box>
                                        </Box>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => removeImage(index, 'videos')}
                                            disabled={disabled}
                                            sx={{
                                                position: 'absolute',
                                                top: -8,
                                                right: -8,
                                                minWidth: '24px',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                p: 0,
                                                bgcolor: 'white',
                                                '&:hover': {
                                                    bgcolor: '#ffebee'
                                                }
                                            }}
                                        >
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

export default MediaUploadSection;