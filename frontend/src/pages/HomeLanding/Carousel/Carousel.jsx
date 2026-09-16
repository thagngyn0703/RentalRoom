import React from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { ArrowForward, HomeWorkOutlined, Tune, FavoriteBorder } from '@mui/icons-material';

export default function HomeHero() {
  return (
    <Box component="section" aria-labelledby="home-heading" className="home-hero">
      <Box className="home-hero-copy">
        <Typography component="p" className="hero-eyebrow">MỘT KHỞI ĐẦU MỚI, MỘT CHỐN THÂN QUEN</Typography>
        <Typography component="h1" id="home-heading" sx={{ fontSize: { xs: '2.5rem', md: '4rem', lg: '4.5rem' }, fontWeight: 800, lineHeight: 1.13, letterSpacing: '-.05em', my: 3 }}>
          Tìm một căn phòng.<br /><Box component="span" sx={{ color: 'primary.main' }}>Bắt đầu tổ ấm.</Box>
        </Typography>
        <Typography sx={{ color: 'text.secondary', maxWidth: 450, fontSize: { xs: 16, md: 18 }, mb: 3.5 }}>
          Nơi ở hợp túi tiền, đúng phong cách sống. Khám phá phòng trọ và kết nối với người bạn cùng nhà phù hợp.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
          <Button href="/rooms" variant="contained" size="large" endIcon={<ArrowForward />}>Khám phá phòng</Button>
          {/* <Button href="/invite-rooms" variant="outlined" size="large">Tìm bạn ở ghép</Button> */}
        </Stack>
        <Stack direction="row" gap={2.5} sx={{ mt: 4, color: 'text.secondary', flexWrap: 'wrap' }}>
          <Box className="hero-benefit"><Tune fontSize="small" /> Lọc theo nhu cầu</Box>
          <Box className="hero-benefit"><FavoriteBorder fontSize="small" /> Lưu phòng yêu thích</Box>
        </Stack>
      </Box>
      <Box className="home-hero-visual">
        <img src="/images/home-interior.webp" alt="Không gian sống sáng thoáng với nội thất gỗ và cây xanh" fetchpriority="high" />
        <Box className="hero-image-label">
          <Box sx={{ bgcolor: '#e2f2e9', borderRadius: 3, p: 1.4, display: 'flex', color: 'primary.main' }}><HomeWorkOutlined /></Box>
          <Box><Typography fontWeight={750}>Chốn riêng, chất riêng.</Typography><Typography variant="body2" color="text.secondary">Tìm nơi bạn muốn trở về mỗi ngày</Typography></Box>
        </Box>
        <Typography className="hero-image-note">Không gian sống truyền cảm hứng · Ảnh minh họa</Typography>
      </Box>
    </Box>
  );
}
