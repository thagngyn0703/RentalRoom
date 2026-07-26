import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Box,
    AppBar,
    Toolbar,
    Avatar,
    Chip,
    Paper,
    IconButton
} from '@mui/material';
import {
    Search as SearchIcon,
    Favorite as FavoriteIcon,
    Person as PersonIcon,
    Support as SupportIcon,
    Logout as LogoutIcon,
    Home as HomeIcon
} from '@mui/icons-material';
import './HomePageUser.css';

const HomePageUser = () => {
    const currentUser = useSelector(state => state.auth.login.currentUser);
    const navigate = useNavigate();

    const handleLogout = () => {
        // Xử lý logout - có thể tạo action logout sau
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Header */}
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main', mb: 3 }}>
                <Toolbar>
                    <HomeIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        TroChung - Hệ thống tìm trọ
                    </Typography>
                    {currentUser && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                {(currentUser.username || currentUser.name)?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body1">
                                {currentUser.username || currentUser.name}
                            </Typography>
                            <IconButton 
                                color="inherit" 
                                onClick={handleLogout}
                                title="Đăng xuất"
                            >
                                <LogoutIcon />
                            </IconButton>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg">
                {/* Welcome Section */}
                <Paper elevation={3} sx={{ p: 4, mb: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
                    <Typography variant="h3" component="h1" gutterBottom color="primary">
                        Chào mừng đến với TroChung
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Hệ thống tìm kiếm và quản lý phòng trọ hiện đại
                    </Typography>
                    {currentUser && (
                        <Chip 
                            label={`Chào ${currentUser.username || currentUser.name}!`}
                            color="primary" 
                            variant="outlined"
                            sx={{ mt: 2 }}
                        />
                    )}
                </Paper>

                {/* Features Section */}
                <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4 }}>
                    Các tính năng
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={3} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <SearchIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h6" component="h3" gutterBottom>
                                    Tìm kiếm trọ
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Tìm kiếm phòng trọ phù hợp với nhu cầu của bạn
                                </Typography>
                                <Button variant="contained" fullWidth>
                                    Tìm kiếm
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={3} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <FavoriteIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                                <Typography variant="h6" component="h3" gutterBottom>
                                    Danh sách yêu thích
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Lưu các phòng trọ yêu thích để xem sau
                                </Typography>
                                <Button variant="contained" fullWidth>
                                    Xem danh sách
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={3} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <PersonIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                                <Typography variant="h6" component="h3" gutterBottom>
                                    Thông tin cá nhân
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Quản lý thông tin tài khoản của bạn
                                </Typography>
                                <Button variant="contained" fullWidth>
                                    Cập nhật
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={3} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <SupportIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                                <Typography variant="h6" component="h3" gutterBottom>
                                    Hỗ trợ
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Liên hệ với chúng tôi khi cần hỗ trợ
                                </Typography>
                                <Button variant="contained" fullWidth>
                                    Liên hệ
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Stats Section */}
                <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4 }}>
                    Thống kê
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Paper 
                            elevation={3} 
                            sx={{ 
                                p: 3, 
                                textAlign: 'center', 
                                bgcolor: 'primary.main', 
                                color: 'primary.contrastText',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-4px)' }
                            }}
                        >
                            <Typography variant="h3" component="div" fontWeight="bold">
                                150+
                            </Typography>
                            <Typography variant="h6">
                                Phòng trọ
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper 
                            elevation={3} 
                            sx={{ 
                                p: 3, 
                                textAlign: 'center', 
                                bgcolor: 'secondary.main', 
                                color: 'secondary.contrastText',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-4px)' }
                            }}
                        >
                            <Typography variant="h3" component="div" fontWeight="bold">
                                500+
                            </Typography>
                            <Typography variant="h6">
                                Người dùng
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper 
                            elevation={3} 
                            sx={{ 
                                p: 3, 
                                textAlign: 'center', 
                                bgcolor: 'success.main', 
                                color: 'success.contrastText',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-4px)' }
                            }}
                        >
                            <Typography variant="h3" component="div" fontWeight="bold">
                                98%
                            </Typography>
                            <Typography variant="h6">
                                Hài lòng
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Footer */}
                <Paper elevation={1} sx={{ p: 2, textAlign: 'center', mt: 4, bgcolor: 'background.paper' }}>
                    <Typography variant="body2" color="text.secondary">
                        &copy; 2025 TroChung. All rights reserved.
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default HomePageUser;