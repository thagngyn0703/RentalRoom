import React from 'react';
import { Box, Container, Typography, Link, Stack } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0B63E5',        // xanh giống hình
        color: 'white',
        py: { xs: 4, md: 6 },
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        {/* Dùng CSS Grid để 4 cột luôn đều nhau và thẳng hàng */}
        <Box
          sx={{
            display: { xs: 'block', md: 'grid' },
            gridTemplateColumns: { md: 'repeat(4, 1fr)' },
            columnGap: { md: 6 },
            rowGap: { xs: 4, md: 0 },
            alignItems: 'start',
          }}
        >
          {/* Cột 1: Điều hướng nhanh */}
          <Box component="nav">
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, fontSize: '1.1rem', textAlign: 'left' }}
            >
              Điều hướng nhanh
            </Typography>
            <Stack spacing={1.25} sx={{ alignItems: 'flex-start' }}>
              <Link href="/" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', '&:hover': { color: '#ffeb3b' } }}>
                Trang chủ
              </Link>
              <Link href="/rooms" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', '&:hover': { color: '#ffeb3b' } }}>
                Tìm kiếm (Nhà trọ / Ở ghép)
              </Link>
              <Link href="/news" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', '&:hover': { color: '#ffeb3b' } }}>
                Tin tức &amp; Blog
              </Link>
              <Link href="/post" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', '&:hover': { color: '#ffeb3b' } }}>
                Đăng tin miễn phí
              </Link>
              <Link href="/contact" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', '&:hover': { color: '#ffeb3b' } }}>
                Liên hệ hỗ trợ
              </Link>
            </Stack>
          </Box>

          {/* Cột 2: Về chúng tôi */}
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, fontSize: '1.1rem', textAlign: 'left' }}
            >
              Về chúng tôi
            </Typography>
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.6, fontSize: '0.9rem', textAlign: 'left' }}
            >
              Website cho thuê phòng trọ,
              nhà trọ nhanh chóng
              và hiệu quả
            </Typography>
          </Box>

          {/* Cột 3: Chính sách & Điều khoản */}
          <Box component="nav">
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, fontSize: '1.1rem', textAlign: 'left' }}
            >
              Chính sách &amp; Điều khoản
            </Typography>
            <Stack spacing={1.25} sx={{ alignItems: 'flex-start' }}>
              <Link href="/privacy" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', '&:hover': { color: '#ffeb3b' } }}>
                Chính sách bảo mật
              </Link>
              <Link href="/terms" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', '&:hover': { color: '#ffeb3b' } }}>
                Điều khoản sử dụng
              </Link>
              <Link href="/payment-policy" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', '&:hover': { color: '#ffeb3b' } }}>
                Chính sách thanh toán &amp; hoàn tiền
              </Link>
              <Link href="/community-guidelines" color="inherit" underline="hover" sx={{ fontSize: '0.9rem', '&:hover': { color: '#ffeb3b' } }}>
                Nguyên tắc cộng đồng
              </Link>
            </Stack>
          </Box>

          {/* Cột 4: Kết nối mạng xã hội */}
          <Box component="nav">
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, fontSize: '1.1rem', textAlign: 'left' }}
            >
              Kết nối mạng xã hội
            </Typography>
            <Stack spacing={1.25} sx={{ alignItems: 'flex-start' }}>
              <Link
                href="https://www.facebook.com/profile.php?id=61582080571720"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                underline="hover"
                sx={{ fontSize: '0.9rem', '&:hover': { color: '#ffeb3b' } }}
              >
                Fanpage Facebook
              </Link>
              <Link
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                underline="hover"
                sx={{ fontSize: '0.9rem', '&:hover': { color: '#ffeb3b' } }}
              >
                TikTok
              </Link>
              <Link
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                underline="hover"
                sx={{ fontSize: '0.9rem', '&:hover': { color: '#ffeb3b' } }}
              >
                Kênh YouTube
              </Link>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
