import React, { useEffect, useState, useCallback } from 'react';
import { Box, Grid, Paper, TextField, Typography, Button, Stack, Divider, Chip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getCaptcha, sendSupport } from './supportService';
import supportApi from '../../../services/api/supportApi';
import { useToast } from '../../../Components/ToastProvider';

const statusLabels = { open: 'Mở', in_progress: 'Đang xử lý', closed: 'Đã đóng' };

const SupportPage = () => {
    const [form, setForm] = useState({ name: '', phone: '', message: '' });
    const [captcha, setCaptcha] = useState({ display: '', token: '' });
    const [mySupports, setMySupports] = useState([]);
    const { showToast } = useToast();

    const fetchMySupports = useCallback(async () => {
        try {
            const res = await supportApi.getMySupports();
            if (res.data?.success) setMySupports(res.data.data || []);
        } catch {
            setMySupports([]);
        }
    }, []);

    const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    // 🟢 Dùng service để lấy captcha
    const loadCaptcha = async () => {
        try {
            const res = await getCaptcha();
            if (res.data?.success) {
                setCaptcha({ display: res.data.display, token: res.data.token });
            }
        } catch {
            console.error('Lỗi khi tải captcha');
        }
    };
    useEffect(() => {
        loadCaptcha();
    }, []);
    useEffect(() => {
        fetchMySupports();
    }, [fetchMySupports]);

    const handleSubmit = async () => {
        if (!form.name?.trim()) {
            showToast('Vui lòng nhập tên của bạn.', 'error');
            return;
        }
        if (!form.message?.trim()) {
            showToast('Vui lòng nhập nội dung liên hệ.', 'error');
            return;
        }
        if (!captcha.token) {
            showToast('Đang tải mã xác nhận. Vui lòng đợi hoặc bấm Đổi.', 'error');
            return;
        }
        if (!(form.captchaCode || '').trim()) {
            showToast('Vui lòng nhập mã xác nhận.', 'error');
            return;
        }
        try {
            const res = await sendSupport(form, captcha.token);
            if (res.data?.success) {
                showToast('Đã gửi liên hệ. Admin sẽ phản hồi và bạn sẽ nhận thông báo.', 'success');
                setForm({ name: '', phone: '', message: '', captchaCode: '' });
                loadCaptcha();
                fetchMySupports();
            } else {
                showToast(res.data?.message || 'Gửi thất bại.', 'error');
            }
        } catch (e) {
            const data = e.response?.data;
            let msg = (typeof data === 'string' ? data : (data?.message || data?.error)) || e.message || 'Gửi thất bại. Vui lòng kiểm tra đăng nhập và mã xác nhận.';
            if (msg === 'Missing required fields' || msg.includes('Missing required')) {
                msg = 'Thiếu thông tin. Vui lòng điền đầy đủ: Tên, Nội dung liên hệ và Mã xác nhận (đúng với mã hiển thị).';
            }
            showToast(msg, 'error');
            loadCaptcha();
        }
    };

    return (
        <Box sx={{ width: '100%', bgcolor: '#fff' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Liên hệ trực tiếp
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                        <Stack spacing={2}>
                            <TextField label="Tên của bạn" required fullWidth size="small"
                                value={form.name} onChange={handleChange('name')} />
                            <TextField label="Điện thoại" fullWidth size="small"
                                value={form.phone} onChange={handleChange('phone')} />
                            <TextField label="Nội dung liên hệ" required fullWidth size="small" multiline minRows={4}
                                value={form.message} onChange={handleChange('message')} />
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={8}>
                                    <TextField label="Mã xác nhận" required fullWidth size="small"
                                        value={form.captchaCode || ''} onChange={handleChange('captchaCode')} />
                                </Grid>
                                <Grid item xs={8} sm={3}>
                                    <Paper variant="outlined" sx={{ p: 1.2, textAlign: 'center', fontWeight: 700, letterSpacing: 4 }}>
                                        {captcha.display || '----'}
                                    </Paper>
                                </Grid>
                                <Grid item xs={4} sm={1}>
                                    <Button variant="text" onClick={loadCaptcha}>Đổi</Button>
                                </Grid>
                            </Grid>
                            <Box>
                                <Button variant="contained" onClick={handleSubmit}>Gửi liên hệ</Button>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                            THÔNG TIN LIÊN HỆ
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                            Chúng tôi biết bạn có rất nhiều sự lựa chọn. Cảm ơn vì đã tin tưởng.
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={1}>
                            <Typography variant="body2"><strong>Điện thoại:</strong> 09678.333.78</Typography>
                            <Typography variant="body2"><strong>Email:</strong> nhatroviet@gmail.com</Typography>
                            <Typography variant="body2"><strong>Zalo:</strong> 09678.333.78</Typography>
                            <Typography variant="body2"><strong>Viber:</strong> 09678.333.78</Typography>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* Lịch sử tin đã gửi & phản hồi từ admin */}
            {mySupports.length > 0 && (
                <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>
                    Tin đã gửi & phản hồi
                </Typography>
            )}
            {mySupports.map((item) => (
                <Accordion key={item._id} elevation={1} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                            <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                                {item.message?.slice(0, 60)}{item.message?.length > 60 ? '...' : ''}
                            </Typography>
                            <Chip label={statusLabels[item.status] || item.status} size="small" color={item.status === 'closed' ? 'success' : 'default'} />
                            {item.adminReply && (
                                <Chip label="Đã phản hồi" size="small" color="primary" />
                            )}
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {new Date(item.createdAt).toLocaleString('vi-VN')}
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{item.message}</Typography>
                        {item.adminReply && (
                            <Paper variant="outlined" sx={{ mt: 2, p: 2, bgcolor: 'primary.50' }}>
                                <Typography variant="subtitle2" color="primary">Phản hồi từ admin</Typography>
                                <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{item.adminReply}</Typography>
                                {item.repliedAt && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        {new Date(item.repliedAt).toLocaleString('vi-VN')}
                                    </Typography>
                                )}
                            </Paper>
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};

export default SupportPage;
