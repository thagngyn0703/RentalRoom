import React, { useEffect, useState } from 'react';
import Carousel from './Carousel/Carousel.jsx';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Section from './Section.jsx';
import { fetchAllRooms, fetchHomeData, fetchRooms } from '../../services/api/postApi';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { FavoriteApi } from '../../services/api';
import { useSelector } from 'react-redux';
import { useToast } from '../../Components/ToastProvider';
import { useNavigate } from 'react-router-dom';
import { resolveRegionCardImage, NEUTRAL_FALLBACK } from '../../utils/viWikiCityImage';

const formatAddress = (item) => {
  if (!item) return '';
  const parts = [];
  if (item.address) parts.push(item.address);
  if (item.ward) parts.push(item.ward);
  if (item.district) parts.push(item.district);
  if (item.province) parts.push(item.province);
  return parts.join(', ');
};

const averageStars = (room) => Number(
  room?.rating ??
  room?.averageRating ??
  0
);

const totalStarVotes = (room) => Number(
  room?.totalRatings ??
  room?.ratingsCount ??
  room?.ratingCount ??
  room?.starsCount ??
  0
);

const scoreByComments = (room) => Number(
  room?.totalComments ??
  room?.commentsCount ??
  room?.commentCount ??
  (Array.isArray(room?.comments) ? room.comments.length : 0) ??
  0
);

const postedAtTs = (room) => {
  const ts = new Date(room?.postedAt || room?.createdAt || 0).getTime();
  return Number.isNaN(ts) ? Number.MAX_SAFE_INTEGER : ts;
};

const normalizeCity = (raw) =>
  String(raw || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(thanh pho|tp\.?|tinh)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const prettifyCityTitle = (raw) => {
  const s = String(raw || '').trim();
  if (!s) return '';
  const stripped = s
    .replace(/^(Thành\s+phố|TP\.?|Tỉnh)\s+/iu, '')
    .trim();
  return stripped || s;
};

const REGION_TOP_LIMIT = 5;

const pickRepresentativeCityQuery = (rawFreq) => {
  let bestRaw = '';
  let bestN = -1;
  rawFreq.forEach((n, raw) => {
    if (n > bestN) {
      bestN = n;
      bestRaw = raw;
    }
  });
  // Use a clean canonical query to avoid split counts
  return prettifyCityTitle(bestRaw || '');
};

const HomePostGrid = ({ items = [], favoriteIds = new Set(), onToggleFavorite, showRecommendationBadge = false }) => {
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Chưa có phòng nào trong mục này.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        },
        gap: 2,
      }}
    >
      {items.map((it) => (
        <Card
          key={it.id}
          onClick={() => navigate(it.roomId ? `/room/${it.roomId}` : `/room/${it.id}`)}
          sx={{
            height: '100%',
            minHeight: 380,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
          }}
        >
          <Box sx={{ position: 'relative', width: '100%', flexShrink: 0 }}>
            <img
              src={it.thumbnail || (process.env.PUBLIC_URL + '/logo192.png')}
              alt={it.title}
              style={{
                width: '100%',
                height: 180,
                objectFit: 'cover',
                display: 'block',
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
              }}
            />
            {it.price && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 8,
                  bottom: 8,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  px: 1.5,
                  py: 0.6,
                  borderRadius: 1,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {it.price}
              </Box>
            )}
            <Tooltip title={favoriteIds.has(String(it.roomId || it.id)) ? 'Bỏ yêu thích' : 'Yêu thích'}>
              <IconButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite && onToggleFavorite(String(it.roomId || it.id));
                }}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(255,255,255,0.9)',
                }}
              >
                {favoriteIds.has(String(it.roomId || it.id)) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
          </Box>
          <CardContent
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 0,
              pt: 1.5,
              pb: 1.5,
            }}
          >
            <Box sx={{ minHeight: 100 }}>
              <Typography variant="subtitle1" fontWeight={700} noWrap>
                {it.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {formatAddress(it)}
              </Typography>
              {showRecommendationBadge && (
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    display: 'inline-block',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: 'rgba(25, 118, 210, 0.08)',
                    color: 'primary.main',
                    fontWeight: 700,
                  }}
                >
                  ⭐ {Number(it.avgStars || 0).toFixed(1)} ({it.starsVotes || 0}) • 💬 {it.commentsScore || 0}
                </Typography>
              )}
              {it.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {it.description}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1, mr: 1 }}>
                {it.author}
              </Typography>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(it.contactUrl || (it.roomId ? `/room/${it.roomId}` : `/room/${it.id}`));
                }}
                size="small"
                variant="outlined"
                sx={{ textTransform: 'none', flexShrink: 0 }}
              >
                Xem chi tiết
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};
/* --- HERO CAROUSEL (có nút next/prev + auto slide) --- */
const HomeLanding = () => {
  const navigate = useNavigate();
  const accessToken = useSelector((s) => s?.auth?.login?.accessToken);
  const { showToast } = useToast();
  const [homeData, setHomeData] = useState({
    featuredPosts: [],
    latestPosts: [],
  });
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [roomStatsByRoomId, setRoomStatsByRoomId] = useState({});
  const [topRegionCards, setTopRegionCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchHomeData();
        if (isMounted && data) {
          setHomeData({
            featuredPosts: data.featuredPosts || [],
            latestPosts: data.latestPosts || [],
          });
        }
      } catch (e) {
        if (isMounted) {
          setError(e.message || 'Lỗi khi tải dữ liệu trang chủ');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!accessToken) {
        setFavoriteIds(new Set());
        return;
      }
      try {
        const res = await FavoriteApi.getMyFavorites();
        const ids = (res?.favorites || []).map((f) => String(f.room?._id || f.clientRoomId || f.room));
        setFavoriteIds(new Set(ids));
      } catch (err) {
        console.error('Error loading favorites on HomeLanding:', err);
      }
    };
    loadFavorites();
    const onFavUpdate = () => loadFavorites();
    window.addEventListener('favoritesUpdated', onFavUpdate);
    return () => window.removeEventListener('favoritesUpdated', onFavUpdate);
  }, [accessToken]);

  const handleToggleFavorite = async (roomId) => {
    if (!accessToken) {
      showToast('Vui lòng đăng nhập để lưu phòng yêu thích.', 'warning');
      return;
    }
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) {
        next.delete(roomId);
        FavoriteApi.removeFavorite(roomId).catch((e) => console.error('Error removing favorite:', e));
      } else {
        next.add(roomId);
        FavoriteApi.addFavorite(roomId).catch((e) => console.error('Error adding favorite:', e));
      }
      try { window.dispatchEvent(new Event('favoritesUpdated')); } catch (_) {}
      return next;
    });
  };

  useEffect(() => {
    const buildRecommendedPosts = async () => {
      setRecommendedLoading(true);
      try {
        const allRooms = await fetchAllRooms({ page: 1, limit: 5000 });

        const buckets = new Map();
        (Array.isArray(allRooms) ? allRooms : []).forEach((room) => {
          const raw = room?.city;
          if (!raw || !String(raw).trim()) return;
          const norm = normalizeCity(raw);
          if (!norm) return;
          if (!buckets.has(norm)) buckets.set(norm, { count: 0, rawFreq: new Map() });
          const b = buckets.get(norm);
          b.count += 1;
          const r = String(raw).trim();
          b.rawFreq.set(r, (b.rawFreq.get(r) || 0) + 1);
        });

        const topNorms = [...buckets.entries()]
          .filter(([, data]) => data.count > 0)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, REGION_TOP_LIMIT);

        const draftCards = topNorms.map(([normKey, data]) => {
          const cityQuery = pickRepresentativeCityQuery(data.rawFreq);
          return {
            key: normKey,
            cityQuery,
            title: prettifyCityTitle(cityQuery),
            count: data.count,
            image: NEUTRAL_FALLBACK,
          };
        });

        const attachRegionImages = async (cards) =>
          Promise.all(
            cards.map(async (c) => ({
              ...c,
              image: await resolveRegionCardImage(c.key, c.title),
            }))
          );

        try {
          const synced = await Promise.all(
            draftCards.map(async (c) => {
              const res = await fetchRooms({
                page: 1,
                limit: 1,
                city: c.cityQuery,
                postType: 'room_rental',
              });
              return { ...c, count: Number(res?.total) ?? c.count };
            })
          );
          const ranked = synced
            .filter((c) => c.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, REGION_TOP_LIMIT);
          setTopRegionCards(await attachRegionImages(ranked));
        } catch (_) {
          const ranked = draftCards
            .filter((c) => c.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, REGION_TOP_LIMIT);
          setTopRegionCards(await attachRegionImages(ranked));
        }

        const rows = (Array.isArray(allRooms) ? allRooms : []).map((room) => ({
          id: room.postId || room.id,
          roomId: room.id,
          title: room.title,
          price: room.price ? `${Number(room.price).toLocaleString('vi-VN')} ${room.unit || 'VND'}/tháng` : '',
          thumbnail: room.image || (Array.isArray(room.images) ? room.images[0] : null),
          address: room.address,
          ward: room.ward,
          district: room.district,
          province: room.city,
          description: room.description || '',
          author: room.author || 'Người đăng',
          avgStars: averageStars(room),
          starsVotes: totalStarVotes(room),
          commentsScore: scoreByComments(room),
          postedAt: room.postedAt || room.createdAt || null,
        }));
        const statsMap = {};
        rows.forEach((r) => {
          if (r.roomId) {
            statsMap[String(r.roomId)] = {
              avgStars: r.avgStars,
              starsVotes: r.starsVotes,
              commentsScore: r.commentsScore,
            };
          }
        });
        setRoomStatsByRoomId(statsMap);
        rows.sort((a, b) => {
          if (b.avgStars !== a.avgStars) return b.avgStars - a.avgStars;
          if (b.commentsScore !== a.commentsScore) return b.commentsScore - a.commentsScore;
          return postedAtTs(a) - postedAtTs(b);
        });
        setRecommendedPosts(rows.slice(0, 4));
      } catch (err) {
        console.error('Unable to build recommended rooms list:', err);
        setRecommendedPosts([]);
        setTopRegionCards([]);
      } finally {
        setRecommendedLoading(false);
      }
    };
    buildRecommendedPosts();
  }, []);

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ mt: 1, p: 2 }}>
        <Carousel sx={{ mt: 2 }} />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ maxWidth: 1500, width: '100%', mx: 'auto', px: 2, pb: 4 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {!loading && !error && (
            <>
              <Section title="Bài mới đăng">
                <HomePostGrid
                  items={(homeData.latestPosts || []).slice(0, 4).map((post) => {
                    const key = String(post?.roomId || post?.id || '');
                    const stats = roomStatsByRoomId[key] || {};
                    return {
                      ...post,
                      avgStars: stats.avgStars ?? 0,
                      starsVotes: stats.starsVotes ?? 0,
                      commentsScore: stats.commentsScore ?? 0,
                    };
                  })}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  showRecommendationBadge
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/rooms?sort=newest&page=1')}
                    sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
                  >
                    Xem tất cả
                  </Button>
                </Box>
              </Section>

              <Box sx={{ height: 20 }} />

              <Section title="Gợi ý cho bạn">
                {recommendedLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : (
                  <>
                    <HomePostGrid
                      items={recommendedPosts}
                      favoriteIds={favoriteIds}
                      onToggleFavorite={handleToggleFavorite}
                      showRecommendationBadge
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/rooms?sort=popular&page=1')}
                        sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
                      >
                        Xem tất cả
                      </Button>
                    </Box>
                  </>
                )}
              </Section>

              <Box sx={{ height: 20 }} />

              <Section title="Bài đăng theo khu vực">
                {recommendedLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : topRegionCards.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Chưa có dữ liệu bài đăng theo khu vực.
                  </Typography>
                ) : topRegionCards.length === 1 ? (
                  <Box
                    key={topRegionCards[0].key}
                    onClick={() => navigate(`/rooms?city=${encodeURIComponent(topRegionCards[0].cityQuery)}&page=1`)}
                    sx={{
                      position: 'relative',
                      borderRadius: 2,
                      overflow: 'hidden',
                      minHeight: { xs: 220, md: 280 },
                      cursor: 'pointer',
                      '&:hover img': { transform: 'scale(1.03)' },
                    }}
                  >
                    <Box
                      component="img"
                      src={topRegionCards[0].image}
                      alt={topRegionCards[0].title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        minHeight: { xs: 220, md: 280 },
                        transition: 'transform 0.25s ease',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.1))',
                      }}
                    />
                    <Box sx={{ position: 'absolute', left: 16, bottom: 14, color: '#fff' }}>
                      <Typography variant="h5" fontWeight={800}>{topRegionCards[0].title}</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {topRegionCards[0].count.toLocaleString('vi-VN')} tin đăng
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1.3fr 1fr' },
                      gap: 1,
                    }}
                  >
                    <Box
                      key={topRegionCards[0].key}
                      onClick={() => navigate(`/rooms?city=${encodeURIComponent(topRegionCards[0].cityQuery)}&page=1`)}
                      sx={{
                        position: 'relative',
                        borderRadius: 2,
                        overflow: 'hidden',
                        minHeight: { xs: 220, md: 320 },
                        cursor: 'pointer',
                        '&:hover img': { transform: 'scale(1.03)' },
                      }}
                    >
                      <Box
                        component="img"
                        src={topRegionCards[0].image}
                        alt={topRegionCards[0].title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.25s ease',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.1))',
                        }}
                      />
                      <Box sx={{ position: 'absolute', left: 16, bottom: 14, color: '#fff' }}>
                        <Typography variant="h5" fontWeight={800}>{topRegionCards[0].title}</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {topRegionCards[0].count.toLocaleString('vi-VN')} tin đăng
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                      {topRegionCards.slice(1).map((area) => (
                        <Box
                          key={area.key}
                          onClick={() => navigate(`/rooms?city=${encodeURIComponent(area.cityQuery)}&page=1`)}
                          sx={{
                            position: 'relative',
                            borderRadius: 2,
                            overflow: 'hidden',
                            minHeight: { xs: 130, md: 155 },
                            cursor: 'pointer',
                            '&:hover img': { transform: 'scale(1.03)' },
                          }}
                        >
                          <Box
                            component="img"
                            src={area.image}
                            alt={area.title}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.25s ease',
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              background: 'linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.1))',
                            }}
                          />
                          <Box sx={{ position: 'absolute', left: 12, bottom: 10, color: '#fff' }}>
                            <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: 22, md: 32 } }}>
                              {area.title}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {area.count.toLocaleString('vi-VN')} tin đăng
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Section>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default HomeLanding;
