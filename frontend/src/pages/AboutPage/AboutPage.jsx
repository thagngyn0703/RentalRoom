import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Divider,
  Paper
} from '@mui/material';
import Grid from '@mui/material/Grid';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import ForumIcon from '@mui/icons-material/Forum';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const AboutPage = () => {
  const features = [
    {
      icon: <HomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Tìm Nơi Ở Lý Tưởng',
      description: 'Hệ thống tìm kiếm thông minh giúp bạn dễ dàng tìm được phòng trọ phù hợp với nhu cầu và ngân sách của mình.'
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Kết Nối Bạn Cùng Phòng',
      description: 'Tìm kiếm những người bạn cùng chí hướng, phù hợp về lối sống và tính cách để cùng chia sẻ không gian sống.'
    },
    {
      icon: <ForumIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Diễn Đàn Cộng Đồng',
      description: 'Nơi chia sẻ kinh nghiệm, kiến thức về thuê trọ, cuộc sống đô thị và kết nối với cộng đồng sinh viên, người lao động.'
    },
    {
      icon: <VerifiedUserIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Xác Minh Tin Cậy',
      description: 'Hệ thống xác minh thông tin người dùng và tin đăng, đảm bảo an toàn và minh bạch cho mọi giao dịch.'
    }
  ];

  const values = [
    {
      icon: <FavoriteIcon sx={{ fontSize: 32, color: '#e91e63' }} />,
      title: 'Thân Thiện',
      description: 'Xây dựng cộng đồng thân thiện, sẵn sàng giúp đỡ lẫn nhau'
    },
    {
      icon: <VerifiedUserIcon sx={{ fontSize: 32, color: '#2196f3' }} />,
      title: 'Minh Bạch',
      description: 'Thông tin rõ ràng, xác thực, bảo vệ quyền lợi người dùng'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 32, color: '#4caf50' }} />,
      title: 'Phát Triển',
      description: 'Không ngừng cải tiến để mang lại trải nghiệm tốt nhất'
    }
  ];

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                Về Chúng Tôi
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 400,
                  mb: 3,
                  opacity: 0.95,
                  fontSize: { xs: '1.25rem', md: '1.5rem' }
                }}
              >
                Trọ Chung - Kết Nối Nơi Ở, Gắn Kết Cộng Đồng
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.1rem',
                  lineHeight: 1.8,
                  opacity: 0.9
                }}
              >
                Chúng tôi không chỉ đơn thuần là một nền tảng tìm trọ. 
                Trọ Chung là cầu nối giúp bạn tìm được nơi ở lý tưởng và 
                những người bạn cùng phòng phù hợp, đồng thời xây dựng một 
                cộng đồng trọ chung vững mạnh, thân thiện và sẵn sàng chia sẻ.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Mission & Vision */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                borderRadius: 3,
                border: '2px solid',
                borderColor: 'primary.light',
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)'
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}
              >
                Sứ Mệnh
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
                Giúp sinh viên, người lao động và cư dân từ các khu vực khác 
                dễ dàng tìm kiếm được nơi ở hợp lý với mức giá phù hợp. 
                Đồng thời, kết nối những người có cùng hoàn cảnh, 
                chí hướng để cùng nhau chia sẻ không gian sống, 
                giảm chi phí và tạo nên những kỷ niệm đáng nhớ.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                borderRadius: 3,
                border: '2px solid',
                borderColor: 'secondary.light',
                background: 'linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%)'
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, mb: 3, color: 'secondary.main' }}
              >
                Tầm Nhìn
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
                Trở thành nền tảng hàng đầu về kết nối nơi ở và cộng đồng 
                trọ chung tại Việt Nam. Xây dựng một cộng đồng vững mạnh 
                nơi mọi người không chỉ tìm được chỗ ở mà còn tìm được 
                những người bạn, những kiến thức hữu ích và sự hỗ trợ 
                khi cần thiết.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Dịch Vụ Của Chúng Tôi
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Trọ Chung cung cấp đầy đủ các tính năng để bạn dễ dàng 
            tìm kiếm và kết nối
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Core Values */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          align="center"
          sx={{ fontWeight: 700, mb: 2 }}
        >
          Giá Trị Cốt Lõi
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
        >
          Những giá trị chúng tôi luôn hướng tới trong mọi hoạt động
        </Typography>
        <Grid container spacing={4}>
          {values.map((value, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 3,
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <Box sx={{ mb: 2 }}>{value.icon}</Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
                  {value.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {value.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Team Section */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Đội Ngũ Lãnh Đạo
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Những người đứng sau sự thành công của Trọ Chung
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              elevation={0}
              sx={{
                maxWidth: 400,
                textAlign: 'center',
                p: 4,
                borderRadius: 3,
                border: '2px solid',
                borderColor: 'primary.light'
              }}
            >
              <Avatar
                src="/images/about/ceo-founder.png"
                alt="Chân dung Nguyễn Đức Thắng — CEO & Founder Trọ Chung"
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                  fontWeight: 600,
                  border: '4px solid',
                  borderColor: 'primary.light'
                }}
              />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Nguyễn Đức Thắng
              </Typography>
              <Typography
                variant="body1"
                color="primary"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                CEO & Founder
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Người sáng lập và điều hành Trọ Chung với tầm nhìn xây dựng 
                một cộng đồng kết nối, chia sẻ và hỗ trợ lẫn nhau trong 
                việc tìm kiếm nơi ở lý tưởng.
              </Typography>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 8,
          color: 'white'
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              Hãy Tham Gia Cùng Chúng Tôi
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600 }}>
              Trở thành một phần của cộng đồng Trọ Chung - nơi bạn không chỉ 
              tìm được nơi ở mà còn tìm được những người bạn đồng hành
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutPage;
