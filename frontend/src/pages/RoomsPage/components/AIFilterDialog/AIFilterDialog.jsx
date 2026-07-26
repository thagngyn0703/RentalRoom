import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Box,
  Typography,
  Divider,
  Paper,
  Chip,
  CircularProgress,
  Backdrop
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SettingsIcon from '@mui/icons-material/Settings';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CategoryFilter from '../FilterDialog/CategoryFilter';
import LocationFilter from '../FilterDialog/LocationFilter';
import PriceRangeFilter from '../FilterDialog/PriceRangeFilter';
import AreaRangeFilter from '../FilterDialog/AreaRangeFilter';
import FeatureFilter from '../FilterDialog/FeatureFilter';

const AIFilterDialog = ({
  open,
  onClose,
  aiSearchText,
  setAISearchText,
  aiLoading,
  selectedCategory,
  setSelectedCategory,
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
  provinceOptions,
  districtOptions,
  wardOptions,
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
  selectedFeatures,
  setSelectedFeatures,
  clearAllFilters,
  onAISearch,
  setSearchParams
}) => {
  const handleClearAll = () => {
    clearAllFilters();
    setAISearchText('');
    setSearchParams(new URLSearchParams({ page: '1' }));
  };

  const handleAISearch = () => {
    if (onAISearch) {
      onAISearch();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: '#667eea' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Tìm kiếm thông minh với AI
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* AI Text Input Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            border: '2px solid',
            borderColor: 'rgba(102, 126, 234, 0.2)',
            borderRadius: 2
          }}
        >
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            🤖 Mô tả nhu cầu của bạn
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 2 }}
          >
            Hãy mô tả chi tiết về người bạn cùng phòng lý tưởng, sở thích, thói quen sinh hoạt...
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            value={aiSearchText}
            onChange={(e) => setAISearchText(e.target.value)}
            placeholder="Ví dụ: Tôi tìm người bạn cùng phòng năng động, thích thể thao, không hút thuốc, sống sạch sẽ, thường xuyên học tập vào buổi tối..."
            variant="outlined"
            sx={{
              bgcolor: 'white',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                  borderWidth: 2
                }
              }
            }}
          />
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">
              Gợi ý:
            </Typography>
            {[
              'Không hút thuốc',
              'Yên tĩnh',
              'Sạch sẽ',
              'Thân thiện',
              'Thích nấu ăn'
            ].map((suggestion) => (
              <Chip
                key={suggestion}
                label={suggestion}
                size="small"
                onClick={() => {
                  setAISearchText(prev => 
                    prev ? `${prev}, ${suggestion.toLowerCase()}` : suggestion
                  );
                }}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'rgba(102, 126, 234, 0.1)'
                  }
                }}
              />
            ))}
          </Box>
        </Paper>

        <Divider sx={{ my: 3 }}>
          <Chip label="Bộ lọc chi tiết (Tùy chọn)" size="small" />
        </Divider>

        {/* Standard Filters */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
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
          provinces={provinceOptions}
          districts={districtOptions}
          wards={wardOptions}
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
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button color="secondary" onClick={handleClearAll}>
          Xóa tất cả
        </Button>
        <Button onClick={onClose}>
          Đóng
        </Button>
        <Button 
          variant="contained" 
          onClick={handleAISearch}
          disabled={!aiSearchText.trim()}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #5e3c82 100%)',
            },
            '&.Mui-disabled': {
              background: '#e0e0e0'
            }
          }}
          startIcon={<AutoAwesomeIcon />}
        >
          Tìm kiếm với AI
        </Button>
      </DialogActions>

      {/* AI Loading Overlay */}
      <Backdrop
        open={aiLoading}
        sx={{
          position: 'absolute',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
          backdropFilter: 'blur(8px)',
          borderRadius: 2
        }}
      >
        {/* Animated background particles */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            opacity: 0.3
          }}
        >
          {[...Array(8)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: `${20 + i * 10}px`,
                height: `${20 + i * 10}px`,
                borderRadius: '50%',
                background: i % 2 === 0 
                  ? 'radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(118, 75, 162, 0.4) 0%, transparent 70%)',
                left: `${(i * 15) % 100}%`,
                top: `${(i * 20) % 100}%`,
                animation: `float-${i % 3} ${4 + i * 0.5}s ease-in-out infinite`,
                '@keyframes float-0': {
                  '0%, 100%': {
                    transform: 'translate(0, 0) scale(1)',
                  },
                  '50%': {
                    transform: 'translate(30px, -30px) scale(1.2)',
                  }
                },
                '@keyframes float-1': {
                  '0%, 100%': {
                    transform: 'translate(0, 0) scale(1)',
                  },
                  '50%': {
                    transform: 'translate(-30px, 30px) scale(1.3)',
                  }
                },
                '@keyframes float-2': {
                  '0%, 100%': {
                    transform: 'translate(0, 0) scale(1)',
                  },
                  '50%': {
                    transform: 'translate(20px, 40px) scale(1.1)',
                  }
                }
              }}
            />
          ))}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Animated AI Icon */}
          <Box
            sx={{
              position: 'relative',
              width: 140,
              height: 140,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Outer rotating gears */}
            <SettingsIcon
              sx={{
                position: 'absolute',
                fontSize: 45,
                color: '#667eea',
                top: -5,
                right: 10,
                animation: 'spin 3s linear infinite',
                opacity: 0.7,
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }}
            />
            
            <SettingsIcon
              sx={{
                position: 'absolute',
                fontSize: 35,
                color: '#764ba2',
                bottom: 5,
                left: 5,
                animation: 'spin-reverse 2.5s linear infinite',
                opacity: 0.7,
                '@keyframes spin-reverse': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(-360deg)' }
                }
              }}
            />

            {/* Outer rotating circle */}
            <Box
              sx={{
                position: 'absolute',
                width: '85%',
                height: '85%',
                borderRadius: '50%',
                border: '3px solid transparent',
                borderTopColor: '#667eea',
                borderRightColor: '#764ba2',
                animation: 'spin 2s linear infinite',
              }}
            />
            
            {/* Middle rotating circle */}
            <Box
              sx={{
                position: 'absolute',
                width: '65%',
                height: '65%',
                borderRadius: '50%',
                border: '2px dashed rgba(102, 126, 234, 0.5)',
                animation: 'spin-reverse 3s linear infinite',
              }}
            />
            
            {/* Sparkles flying around */}
            {[0, 1, 2, 3].map((index) => (
              <AutoAwesomeIcon
                key={index}
                sx={{
                  position: 'absolute',
                  fontSize: 16,
                  color: index % 2 === 0 ? '#667eea' : '#764ba2',
                  animation: `sparkle-${index} 2s ease-in-out infinite`,
                  [`@keyframes sparkle-${index}`]: {
                    '0%, 100%': {
                      transform: `rotate(${index * 90}deg) translateY(-50px) scale(0)`,
                      opacity: 0
                    },
                    '50%': {
                      transform: `rotate(${index * 90}deg) translateY(-70px) scale(1)`,
                      opacity: 1
                    }
                  },
                  animationDelay: `${index * 0.3}s`
                }}
              />
            ))}
            
            {/* Center Robot with Brain Icon */}
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <SmartToyIcon
                sx={{
                  fontSize: 60,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'robot-think 1.5s ease-in-out infinite',
                  '@keyframes robot-think': {
                    '0%, 100%': { 
                      transform: 'scale(1) rotate(0deg)',
                    },
                    '25%': {
                      transform: 'scale(1.05) rotate(-3deg)',
                    },
                    '75%': { 
                      transform: 'scale(1.05) rotate(3deg)',
                    }
                  }
                }}
              />
              
              {/* Brain icon above robot - thinking effect */}
              <PsychologyIcon
                sx={{
                  position: 'absolute',
                  top: -15,
                  fontSize: 24,
                  color: '#764ba2',
                  animation: 'brain-pulse 1s ease-in-out infinite',
                  '@keyframes brain-pulse': {
                    '0%, 100%': {
                      transform: 'scale(0.8)',
                      opacity: 0.5
                    },
                    '50%': {
                      transform: 'scale(1.2)',
                      opacity: 1
                    }
                  }
                }}
              />
            </Box>
          </Box>
          
          {/* Loading Text */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              AI đang phân tích...
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                fontWeight: 500
              }}
            >
              Đang tìm kiếm kết quả phù hợp nhất cho bạn
            </Typography>
          </Box>
          
          {/* Animated dots */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#667eea',
                  animation: `bounce 1.4s infinite ease-in-out ${index * 0.16}s`,
                  '@keyframes bounce': {
                    '0%, 80%, 100%': {
                      transform: 'scale(0)',
                      opacity: 0.5
                    },
                    '40%': {
                      transform: 'scale(1)',
                      opacity: 1
                    }
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      </Backdrop>
    </Dialog>
  );
};

export default AIFilterDialog;
