import React from 'react';
import { Box, Container, Typography, Link, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeWorkOutlined from '@mui/icons-material/HomeWorkOutlined';

const groups = [
  ['Khám phá', [['Tìm phòng trọ', '/rooms'], ['Tìm bạn ở ghép', '/invite-rooms'], ['Phòng yêu thích', '/favorites']]],
  ['Dành cho bạn', [['Đăng tin cho thuê', '/user/post-room'], ['Quản lý tài khoản', '/user/profile'], ['Trung tâm hỗ trợ', '/user/support']]],
  ['Trọ Chung', [['Về chúng tôi', '/about'], ['Đăng nhập', '/login'], ['Tạo tài khoản', '/register']]],
];
export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#153e35', color: '#fff', mt: 'auto', pt: { xs: 5, md: 7 }, pb: 3 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }, gap: { xs: 4, md: 5 }, pb: 5 }}>
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}><HomeWorkOutlined /><Typography variant="h5" color="inherit">trọ chung<span style={{ color: '#a9d8b8' }}>.</span></Typography></Stack>
            <Typography sx={{ color: '#bad0c4', maxWidth: 300, fontSize: 14 }}>Một căn phòng phù hợp. Một người bạn cùng nhà. Một khởi đầu đáng mong chờ.</Typography>
          </Box>
          {groups.map(([title, links]) => <Box key={title}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>{title}</Typography>
            <Stack gap={1.3}>{links.map(([label, to]) => <Link key={to} component={RouterLink} to={to} underline="hover" sx={{ color: '#bad0c4', fontSize: 14 }}>{label}</Link>)}</Stack>
          </Box>)}
        </Box>
        <Box sx={{ borderTop: '1px solid #3b5c50', pt: 3, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', color: '#bad0c4' }}>
          <Typography variant="caption">© {new Date().getFullYear()} Trọ Chung</Typography>
          <Typography variant="caption">Kết nối nơi ở, chia sẻ cuộc sống.</Typography>
        </Box>
      </Container>
    </Box>
  );
}
