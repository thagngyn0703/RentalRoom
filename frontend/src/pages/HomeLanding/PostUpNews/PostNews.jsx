import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

const PostNews = ({postType='all'}) => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    const [items, setItems] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);

    const containerRef = useRef(null);

    // format price with thousands separators
    const formatPrice = (p) => {
        if (p === undefined || p === null || p === '') return '';
        const n = Number(String(p).replace(/[^0-9.-]+/g, ''));
        if (Number.isNaN(n)) return String(p);
        return new Intl.NumberFormat('vi-VN').format(n);
    };

    const formatAddress = (room) => {
        if (!room) return '';
        const parts = [];
        if (room.address) parts.push(room.address);
        if (room.ward) parts.push(room.ward);
        if (room.district) parts.push(room.district);
        if (room.province) parts.push(room.province);
        return parts.join(', ');
    };

    const getPostTypeLabel = (postType) => {
        if (!postType) return null;
        const key = String(postType).toLowerCase();
        const rentKeys = ['rent', 'for_rent', 'renting', 'room_rental', 'cho-thue', 'cho thuê'];
        const shareKeys = ['share', 'roommate', 'finding_roommate', 'invite roomate', 'tìm ở ghép'];
        if (rentKeys.includes(key)) return { text: 'Cho thuê', color: 'primary.main' };
        if (shareKeys.includes(key)) return { text: 'Tìm ở ghép', color: 'warning.main' };
        return { text: String(postType), color: 'grey.800' };
    };

    // guard concurrent loads with a ref to avoid stale-deps re-trigger loops
    const isLoadingRef = useRef(false);

    const fetchPage = async (cursor = null) => {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;
        setIsLoading(true);
        setError(null);
        try {
            // Backend giới hạn tối đa 100 nên đặt limit = 100
            const params = { limit: 100 };
            if (postType && postType !== 'all') {
                params.postType = postType;
            }
            if (cursor) {
                params.after = cursor;
            }

            const res = await axios.get('/api/posts/latest', {
                params,
                withCredentials: true
            });

            if (res.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const data = res.data;

            if (!data.success) {
                throw new Error(data.message || 'API error');
            }
            setItems(prev => [...prev, ...(data.items || [])]);

            setNextCursor(data.nextCursor || null);

            setHasMore(Boolean(data.hasMore));
        } catch (err) {
            setError(err.message || 'Error fetching posts');
        } finally {
            isLoadingRef.current = false;
            setIsLoading(false);
        }
    };

    // load initial page once on mount
    useEffect(() => { fetchPage(); }, []);

    // No infinite scroll: user requested explicit "Xem thêm" button on all devices.

    const scrollNext = () => {
        const el = containerRef.current;
        if (!el) return;
        const card = el.querySelector('article');
        const distance = card ? card.clientWidth + 16 : el.clientWidth * 0.9;
        el.scrollBy({ left: distance, behavior: 'smooth' });
    };
    const scrollPrev = () => {
        const el = containerRef.current;
        if (!el) return;
        const card = el.querySelector('article');
        const distance = card ? card.clientWidth + 16 : el.clientWidth * 0.9;
        el.scrollBy({ left: -distance, behavior: 'smooth' });
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ position: 'relative' }}>
                {isDesktop && (
                    <>
                        <IconButton
                            onClick={scrollPrev}
                            aria-label="Previous"
                            sx={{
                                position: 'absolute',
                                left: 8,
                                top: '42%',
                                zIndex: 20,
                                width: 48,
                                height: 48,
                                bgcolor: 'rgba(255,255,255,0.95)',
                                boxShadow: 2,
                                '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                            }}
                        >
                            <ChevronLeftIcon fontSize="large" />
                        </IconButton>
                        <IconButton
                            onClick={scrollNext}
                            aria-label="Next"
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: '42%',
                                zIndex: 20,
                                width: 48,
                                height: 48,
                                bgcolor: 'rgba(255,255,255,0.95)',
                                boxShadow: 2,
                                '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                            }}
                        >
                            <ChevronRightIcon fontSize="large" />
                        </IconButton>
                    </>
                )}

                <Box
                    ref={containerRef}
                    sx={{
                        display: 'flex',
                        gap: 2,
                        flexDirection: isDesktop ? 'row' : 'column',
                        overflowX: isDesktop ? 'auto' : 'hidden',
                        overflowY: isDesktop ? 'hidden' : 'auto',
                        px: 1,
                        py: 1,
                        '&::-webkit-scrollbar': { display: isDesktop ? 'auto' : 'none' }
                    }}
                >
                    {items.map((it) => (
                        <Card
                            component="article"
                            key={it.id}
                            sx={{
                                width: { xs: '100%', sm: '50%', md: '33.3333%', lg: '25%' },
                                flex: '0 0 auto',
                                minHeight: { xs: 300, sm: 240, md: 240, lg: 260 },
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Box sx={{ position: 'relative', width: '100%' }}>
                                <img
                                    src={it.room?.images?.[0] || (process.env.PUBLIC_URL + '/logo192.png')}
                                    alt={it.title}
                                    style={{
                                        width: '100%',
                                        height: '180px',
                                        objectFit: 'cover',
                                        display: 'block',
                                        borderTopLeftRadius: 6,
                                        borderTopRightRadius: 6
                                    }}
                                />
                                {it.postTier && (
                                    <Box sx={{ position: 'absolute', left: 8, top: 8, bgcolor: 'primary.main', color: '#fff', px: 1, py: 0.4, borderRadius: 1, fontSize: 12, fontWeight: 700 }}>{it.postTier}</Box>
                                )}
                                {(() => {
                                    const b = getPostTypeLabel(it.postType);
                                    return b ? (
                                        <Box sx={{ position: 'absolute', right: 8, top: 8, bgcolor: b.color, color: '#fff', px: 1, py: 0.4, borderRadius: 1, fontSize: 12, fontWeight: 700 }}>{b.text}</Box>
                                    ) : null;
                                })()}
                                <Box sx={{ bgcolor: 'primary.main', color: '#fff', px: 1.5, py: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                        {it.room ? `${formatPrice(it.room.price) || ''} ${it.room.unit ? it.room.unit + ' ' : ''}/ tháng` : ''}
                                    </Typography>
                                    <Typography variant="caption">{it.room ? `${it.room.area}m² • ${it.room.roomType || ''}` : ''}</Typography>
                                </Box>
                            </Box>
                            <CardContent sx={{ pt: 1, pb: 2, display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="700" noWrap>{it.title}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{formatAddress(it.room)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                  
                                    <Button component="a" href={`/room/${it.room?.id }`} size="small" variant="outlined" sx={{ textTransform: 'none' }}>Xem chi tiết</Button>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Inline load-more card placed as last item so it's at the rightmost end when scrolled */}
                    {hasMore && (
                        <Card
                            component="div"
                            sx={{
                                width: { xs: '100%', sm: '50%', md: '33.3333%', lg: '25%' },
                                flex: '0 0 auto',
                                minHeight: { xs: 160, sm: 140, md: 140, lg: 160 },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'background.paper',
                                boxShadow: 1
                            }}
                        >
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<ExpandMoreIcon />}
                                onClick={() => fetchPage(nextCursor)}
                                disabled={isLoading}
                                sx={{
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    boxShadow: 'none'
                                }}
                            >
                                {isLoading ? 'Đang tải...' : 'Xem thêm'}
                            </Button>
                        </Card>
                    )}
                </Box>
            </Box>

            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && <Typography color="error">{error}</Typography>}

            {/* load-more is rendered inline as the last card inside the scroll container */}

            {!hasMore && (
                <Typography sx={{ textAlign: 'center', mt: 2 }} color="text.secondary">Đã tải hết</Typography>
            )}
        </Box>
    );
};

export default PostNews;
