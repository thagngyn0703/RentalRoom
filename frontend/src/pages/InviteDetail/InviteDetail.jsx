import React, { useEffect, useState } from 'react';
import { FavoriteApi } from '../../services/api';
import { fetchPostById, fetchAllRooms } from '../../services/api/postApi';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Avatar,
  Rating as MuiRating,
} from '@mui/material';
import {
  ArrowBack,
  FavoriteBorder,
  Favorite,
  Share,
  Phone,
  LocationOn,

  PlayArrow,
 
  Message,
  Save,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { CommentApi } from '../../services/api/commentApi';
import { RatingApi } from '../../services/api/ratingApi';
import { useSelector } from 'react-redux';

const InviteDetail = () => {
  const { id } = useParams(); // id is post id
  const navigate = useNavigate();
  const accessToken = useSelector((s) => s?.auth?.login?.accessToken);
  const currentUser = useSelector((s) => s?.auth?.login?.currentUser);
  const currentUserId = String(currentUser?._id || currentUser?.id || '');
  const [room, setRoom] = useState(null);
  const [post, setPost] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [similarRooms, setSimilarRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [myRating, setMyRating] = useState(null);
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
  const [replyFor, setReplyFor] = useState(null);
  const [editFor, setEditFor] = useState(null);
  const [editText, setEditText] = useState('');
  const [showContactCard, setShowContactCard] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load favorites: if logged in -> load from backend, otherwise keep empty in-memory set
        if (accessToken) {
          try {
            const resFav = await FavoriteApi.getMyFavorites();
            const ids = (resFav?.favorites || []).map(f => String(f.room?._id || f.clientRoomId || f.room));
            setFavorites(new Set(ids));
          } catch (err) {
            console.error('Error loading favorites from backend:', err);
            setFavorites(new Set());
          }
        } else {
          setFavorites(new Set());
        }

        // Fetch post (post detail should populate userInfo and room)
        const p = await fetchPostById(id);
        setPost(p);
        if (!p) {
          setLoading(false);
          return;
        }

        // Build a room-like object from post.room so UI matches RoomDetailPage
        const r = p.room || null;
        const foundRoom = r ? {
          id: String(r._id || r.id || ''),
          postId: String(p._id || p.id || ''),
          title: p.title || r.title || '',
          price: r.price || p.price || 0,
          unit: r.unit || p.unit || 'VND',
          area: r.area || 0,
          roomType: r.roomType || '',
          address: r.address || '',
          city: r.province || r.city || p.city || '',
          district: r.district || '',
          ward: r.ward || '',
          image: (r.images && r.images.length) ? r.images[0] : (r.image || p.image || '/logo512.png'),
          images: r.images || p.images || [],
          videos: r.videos || p.videos || [],
          utilities: r.utilities || p.utilities || [],
          additionalCosts: r.additionalCosts || p.additionalCosts || [],
          notes: r.notes || p.notes || '',
          author: p.user?.username || r.user?.username || 'Người đăng',
          phone: p.user?.phone || r.user?.phone || '',
          email: p.user?.email || r.user?.email || '',
          description: p.overviewDescription || r.description || p.description || '',
          status: p.status || r.status || 'pending',
          postedAt: p.createdAt || r.createdAt || new Date().toISOString()
        } : {
          // If no room object, still provide minimal fields from post
          id: String(p._id || p.id || ''),
          postId: String(p._id || p.id || ''),
          title: p.title || '',
          price: p.price || 0,
          unit: p.unit || 'VND',
          area: p.area || 0,
          roomType: p.roomType || '',
          address: '',
          city: p.city || '',
          district: p.district || '',
          ward: p.ward || '',
          image: p.image || '/logo512.png',
          images: p.images || [],
          utilities: p.utilities || [],
          additionalCosts: p.additionalCosts || [],
          notes: p.notes || '',
          author: p.user?.username || 'Người đăng',
          phone: p.user?.phone || '',
          email: p.user?.email || '',
          description: p.overviewDescription || p.description || '',
          status: p.status || 'pending',
          postedAt: p.createdAt || new Date().toISOString()
        };

        setRoom(foundRoom);

        // Load comments and ratings using post id
        const postId = p._id || p.id || foundRoom.postId;
        if (postId) {
          try {
            const cmtPromise = CommentApi.listByPost(postId).catch(() => []);
            const statsPromise = RatingApi.stats(postId).catch(() => ({ average: 0, count: 0 }));
            const minePromise = accessToken ? RatingApi.me(postId).catch(() => null) : Promise.resolve(null);
            const [cmt, stats, mine] = await Promise.all([cmtPromise, statsPromise, minePromise]);
            setComments(Array.isArray(cmt) ? cmt : []);
            setRatingStats(stats || { average: 0, count: 0 });
            setMyRating(mine || null);
          } catch (e) { console.error('comments/ratings', e); setComments([]); setRatingStats({ average: 0, count: 0 }); setMyRating(null); }
        }

        // similar rooms
        const allRooms = await fetchAllRooms();
        const similar = allRooms.filter(rm => rm && String(rm.id) !== foundRoom.id).slice(0, 3);
        setSimilarRooms(similar);

        // reviews from localStorage (fallback)
        const savedReviews = localStorage.getItem(`reviews_${foundRoom.id}`);
        if (savedReviews) setReviews(JSON.parse(savedReviews));
        else setReviews([]);

        setLoading(false);
      } catch (e) {
        console.error('Error loading invite detail:', e);
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Auto-hide contact card on mobile
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth < 768) setShowContactCard(false); else setShowContactCard(true); };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleFavorite = async () => {
    if (!accessToken) {
      try { alert('Vui lòng đăng nhập để lưu phòng yêu thích.'); } catch (_) {}
      return;
    }
    const MAX_FAVORITES = 20;
    const key = String(room?.id || id);
    const newFavorites = new Set(favorites);
    if (newFavorites.has(key)) {
      newFavorites.delete(key);
      try { await FavoriteApi.removeFavorite(key); } catch (_) {}
    } else {
      if (newFavorites.size >= MAX_FAVORITES) { try { alert(`Bạn chỉ có thể lưu tối đa ${MAX_FAVORITES} phòng yêu thích.`); } catch (_) {} return; }
      newFavorites.add(key);
      try { await FavoriteApi.addFavorite(key); } catch (_) {}
    }
    setFavorites(newFavorites);
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const handleToggleFavorite = async (roomId) => {
    if (!accessToken) {
      try { alert('Vui lòng đăng nhập để lưu phòng yêu thích.'); } catch (_) {}
      return;
    }
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) {
        next.delete(roomId);
        FavoriteApi.removeFavorite(roomId).catch(() => {});
      } else {
        next.add(roomId);
        FavoriteApi.addFavorite(roomId).catch(() => {});
      }
      try { window.dispatchEvent(new Event('favoritesUpdated')); } catch (err) { console.error(err); }
      return next;
    });
  };

  const handleBack = () => navigate(-1);

  if (loading) {
    return (<Box sx={{ p: 3, textAlign: 'center' }}><Typography>Đang tải...</Typography></Box>);
  }

  if (!room) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Không tìm thấy bài mời</Typography>
        <Button onClick={handleBack} sx={{ mt: 2 }}>Quay lại</Button>
      </Box>
    );
  }

  const isFavorite = favorites.has(String(room.id));

  // preferences
  const prefs = post?.userInfo || {};
  const interests = Array.isArray(prefs.interests) ? prefs.interests : (prefs.interests ? [prefs.interests] : []);
  const habits = Array.isArray(prefs.habits) ? prefs.habits : (prefs.habits ? [prefs.habits] : []);
  const dislikes = Array.isArray(prefs.dislikes) ? prefs.dislikes : (prefs.dislikes ? [prefs.dislikes] : []);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ bgcolor: 'grey.100' }}><ArrowBack/></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>{room.title}</Typography>
        <Tooltip title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}>
          <IconButton onClick={toggleFavorite} size="large" sx={{ bgcolor: 'grey.100' }}>{isFavorite ? <Favorite color="error" fontSize="large" /> : <FavoriteBorder fontSize="large" />}</IconButton>
        </Tooltip>
        <IconButton sx={{ bgcolor: 'grey.100' }}><Share/></IconButton>
      </Stack>

      {/* Price & rating */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{room.title}</Typography>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
              <Chip label="Invite" color="primary" size="small" />
              <MuiRating value={Number(ratingStats.average) || 0} readOnly precision={0.5} size="small" />
              <Typography variant="body2" color="text.secondary">({ratingStats.count} Reviews)</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOn sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body1" color="text.secondary">{room.district}, {room.city}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>{room.price} {room.unit}</Typography>
              <Typography variant="h6" color="text.secondary">{room.area}m²</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          {/* Gallery */}
          <Paper sx={{ overflow: 'hidden', borderRadius: 2, mb: 3 }}>
            <Grid container spacing={1}>
              <Grid item xs={12} md={8}>
                <Box sx={{ position: 'relative', height: 400 }}>
                  <Box component="img" src={room.image} alt={room.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Grid container spacing={1} sx={{ height: '100%' }}>
                  {[1,2,3,4].map((index) => (
                    <Grid item xs={6} key={index}>
                      <Box sx={{ position: 'relative', height: index === 1 ? 200 : 95, borderRadius: 1, overflow: 'hidden' }}>
                        <Box component="img" src={room.image} alt={`${room.title} ${index}`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {index === 4 && (
                          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>+1</Box>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* Utilities */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Tiện Ích & Nội Thất</Typography>
            {Array.isArray(room.utilities) && room.utilities.length > 0 ? (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>{room.utilities.map((u, idx) => (<Chip key={idx} label={u} variant="outlined" />))}</Stack>
            ) : (<Typography variant="body2" color="text.secondary">Chưa cập nhật</Typography>)}
          </Paper>

          {/* Costs */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Chi Phí</Typography>
            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1}><Typography variant="body2" sx={{ fontWeight: 600 }}>Giá thuê/tháng:</Typography><Typography variant="body2">{room.price} {room.unit}</Typography></Stack>
              {Array.isArray(room.additionalCosts) && room.additionalCosts.length > 0 ? (
                room.additionalCosts.map((c, idx) => (
                  <Stack key={idx} direction="row" spacing={1}><Typography variant="body2" sx={{ fontWeight: 600 }}>{c.type}:</Typography><Typography variant="body2">{c.frequency}</Typography></Stack>
                ))
              ) : (<Typography variant="body2" color="text.secondary">Chưa cập nhật chi phí phát sinh</Typography>)}
            </Stack>
          </Paper>

          {/* Description */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>{room.description}</Typography>
          </Paper>

          {/* Preferences — extra fields for invite posts */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Thông tin ,lối sống </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Sở thích</Typography>
            {interests.length ? <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1 }}>{interests.map((it, i) => (<Chip key={i} label={it} />))}</Stack> : <Typography variant="body2" color="text.secondary">Không có</Typography>}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>Thói quen</Typography>
            {habits.length ? <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1 }}>{habits.map((it, i) => (<Chip key={i} label={it} />))}</Stack> : <Typography variant="body2" color="text.secondary">Không có</Typography>}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>Không thích</Typography>
            {dislikes.length ? <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>{dislikes.map((it, i) => (<Chip key={i} label={it} />))}</Stack> : <Typography variant="body2" color="text.secondary">Không có</Typography>}
          </Paper>

          {/* Video */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Video</Typography>
            <Box sx={{ position: 'relative', height: 300, borderRadius: 2, overflow: 'hidden' }}>
              <Box component="img" src={room.image} alt="Video thumbnail" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'rgba(0,0,0,0.7)', borderRadius: '50%', p: 2, cursor: 'pointer' }}>
                <PlayArrow sx={{ fontSize: 40, color: 'white' }} />
              </Box>
            </Box>
          </Paper>

          {/* Ratings & comments (same as RoomDetailPage but bound to the post) */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mr: 'auto' }}>Đánh giá & Bình luận</Typography>
              <MuiRating value={myRating?.stars || 0} precision={1} onChange={async (_e, val) => {
                if (!accessToken) { try { alert('Bạn cần đăng nhập để đánh giá'); } catch (_) {} return; }
                try {
                  const postId = post?._id || post?.id || room.postId;
                  const saved = await RatingApi.upsert(postId, { stars: val, review: '' });
                  setMyRating(saved);
                  const stats = await RatingApi.stats(postId);
                  setRatingStats(stats);
                  try { window.dispatchEvent(new Event('ratingUpdated')); } catch (_) {}
                } catch (e) { console.error('Rating failed', e); alert('Lỗi khi lưu đánh giá'); }
              }} />
              <Typography variant="body2" color="text.secondary">Trung bình: {Number(ratingStats.average).toFixed(1)} ({ratingStats.count})</Typography>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Avatar>{(room.author || 'N').charAt(0)}</Avatar>
              <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Viết bình luận..." style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e0e0e0' }} />
                <Button variant="contained" onClick={async () => {
                  if (!newComment.trim()) return;
                  if (!accessToken) { try { alert('Bạn cần đăng nhập để bình luận'); } catch (_) {} return; }
                  try {
                    const postId = post?._id || post?.id || room.postId;
                    const c = await CommentApi.create(postId, { content: newComment });
                    setComments((prev) => [...prev, c]);
                    setNewComment('');
                    try { const stats = await RatingApi.stats(postId); setRatingStats(stats); } catch (_) {}
                  } catch (e) { console.error('Comment failed', e); alert('Lỗi khi gửi bình luận'); }
                }} sx={{ textTransform: 'none' }}>Gửi</Button>
                <Button variant="text" onClick={() => navigate(`/room/${room.id}/reviews`)} sx={{ textTransform: 'none' }}>View all</Button>
              </Box>
            </Stack>

            <Stack spacing={1.5}>
              {comments.map((c) => {
                const isCommentOwner = String(c.user?._id || c.user?.id || c.user || '') === currentUserId;
                return (
                <Box key={c._id}>
                  <Stack direction="row" spacing={1}>
                    <Avatar>{(c.user?.username || 'U').charAt(0)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{c.user?.username || 'User'}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(c.createdAt).toLocaleString()}</Typography>
                      </Stack>
                      {editFor?.id === c._id ? (
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          <input value={editText} onChange={(e) => setEditText(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #e0e0e0' }} />
                          <Button size="small" onClick={async () => { try { const updated = await CommentApi.update(c._id, { content: editText }); setComments((prev) => prev.map(x => x._id === c._id ? { ...x, content: updated.content, isEdited: true } : x)); setEditFor(null); setEditText(''); } catch (_) {} }}>Lưu</Button>
                          <Button size="small" color="inherit" onClick={() => { setEditFor(null); setEditText(''); }}>Hủy</Button>
                        </Stack>
                      ) : (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{c.content}</Typography>
                      )}
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.25 }}>
                        <Button size="small" variant="text" onClick={() => setReplyFor(replyFor === c._id ? null : c._id)} sx={{ textTransform: 'none', minWidth: 'auto', px: 0.5 }}>Trả lời</Button>
                        {isCommentOwner && (
                          <Button size="small" variant="text" onClick={() => { setEditFor({ id: c._id }); setEditText(c.content); }} sx={{ textTransform: 'none', minWidth: 'auto', px: 0.5 }}>Sửa</Button>
                        )}
                        <Button size="small" color="error" variant="text" onClick={async () => { try { await CommentApi.remove(c._id); setComments((prev) => prev.filter(x => x._id !== c._id)); } catch (_) {} }} sx={{ textTransform: 'none', minWidth: 'auto', px: 0.5 }}>Xóa</Button>
                      </Stack>
                      {Array.isArray(c.replies) && c.replies.length > 0 && (
                        <Stack spacing={1} sx={{ mt: 1, pl: 5 }}>
                          {c.replies.map((r) => (
                            <Stack direction="row" spacing={1} key={r._id}><Avatar>{(r.user?.username || 'U').charAt(0)}</Avatar><Box><Stack direction="row" spacing={1} alignItems="center"><Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{r.user?.username || 'User'}</Typography><Typography variant="caption" color="text.secondary">{new Date(r.createdAt).toLocaleString()}</Typography></Stack><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{r.content}</Typography></Box></Stack>
                          ))}
                        </Stack>
                      )}
                      {replyFor === c._id && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1, pl: 5 }}>
                          <input placeholder="Trả lời..." onKeyDown={async (ev) => {
                            if (ev.key === 'Enter') {
                              const val = ev.currentTarget.value.trim();
                              if (!val) return;
                              if (!accessToken) { try { alert('Bạn cần đăng nhập để trả lời'); } catch (_) {} return; }
                              try { const postId = post?._id || post?.id || room.postId; const reply = await CommentApi.create(postId, { content: val, parent: c._id }); setComments((prev) => prev.map(x => x._id === c._id ? { ...x, replies: [...(x.replies||[]), reply] } : x)); ev.currentTarget.value = ''; setReplyFor(null); } catch (_) {}
                            }
                          }} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #e0e0e0' }} />
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                </Box>
              );
              })}
            </Stack>
          </Paper>

          {/* Similar rooms */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Phòng Trọ Tương Tự</Typography>
            <Grid container spacing={2}>
              {similarRooms.map((similarRoom) => (
                <Grid item xs={12} sm={4} md={4} key={similarRoom.id}>
                  <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s ease-in-out', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }}>
                    <Box sx={{ position: 'relative', height: 160 }}>
                      <Box component="img" src={similarRoom.image} alt={similarRoom.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <Chip label="Đã Xác Thực" size="small" sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'success.main', color: 'white' }} />
                      <IconButton size="small" onClick={() => handleToggleFavorite(similarRoom.id)} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)' }}>{favorites.has(similarRoom.id) ? <Favorite color="error" fontSize="small"/> : <FavoriteBorder fontSize="small"/>}</IconButton>
                    </Box>
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 1.5 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.875rem' }}>{similarRoom.title}</Typography>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                          <MuiRating value={3} readOnly size="small" />
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>ID:{similarRoom.id}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                          <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{similarRoom.district}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', fontSize: '0.75rem' }}>{similarRoom.area}m²</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} sx={{ mb: 0.5, flexWrap: 'wrap' }}>{similarRoom.utilities?.slice(0, 2).map((utility, index) => (<Chip key={index} label={utility} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />))}</Stack>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '1rem' }}>{similarRoom.price}</Typography>
                          <Chip label="-20%" color="error" size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <Button variant="outlined" size="small" onClick={() => navigate(`/room/${similarRoom.id}`)} sx={{ flex: 1, textTransform: 'none', fontSize: '0.75rem', py: 0.5 }}>Xem chi tiết</Button>
                        <Button variant="contained" size="small" startIcon={<Phone sx={{ fontSize: 14 }} />} sx={{ flex: 1, textTransform: 'none', fontSize: '0.75rem', py: 0.5 }}>Liên hệ</Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button variant="contained" onClick={() => navigate('/rooms')} sx={{ textTransform: 'none' }}>Xem Thêm</Button>
            </Box>
          </Paper>

          {/* Map — SHOW ONLY district and city to hide exact address for invites */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Vị Trí Trên Bản Đồ</Typography>
              <Button variant="contained" size="small" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${room.district}, ${room.city}`)}`} target="_blank" rel="noopener noreferrer" sx={{ textTransform: 'none' }}>Xem Trên Google Map</Button>
            </Box>
            <Box sx={{ height: 400, borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
              <iframe src={`https://www.google.com/maps?q=${encodeURIComponent(`${room.district}, ${room.city}`)}&z=13&output=embed`} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Bản đồ ${room.title}`} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}><strong>Vị trí (bảo mật):</strong> {room.district}, {room.city}</Typography>
          </Paper>

        </Grid>
      </Grid>

      {/* Floating contact card */}
      <Box sx={{ position: 'fixed', right: { xs: 12, md: 28 }, bottom: { xs: 20, md: 28 }, zIndex: 1200, width: { xs: 330, md: 380 } }}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Liên hệ ngay</Typography>
            <Button variant="outlined" size="small" onClick={() => setShowContactCard(!showContactCard)} startIcon={showContactCard ? <ExpandLess /> : <ExpandMore />} sx={{ textTransform: 'none', minWidth: 'auto', p: 1 }}>{showContactCard ? 'Ẩn' : 'Hiện'}</Button>
          </Box>
          {showContactCard && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <Avatar sx={{ width: 52, height: 52 }}>{(room.author || 'N').charAt(0)}</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center"><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{room.author || 'Người đăng'}</Typography></Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center"><Phone sx={{ fontSize: 18, color: 'primary.main' }} /><Typography variant="body1" color="text.secondary">{room.phone || ''}</Typography></Stack>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.25} sx={{ mt: 1.25 }}>
                <Button variant="outlined" size="medium" startIcon={<Phone />} sx={{ textTransform: 'none', flex: 1, borderRadius: 999, fontWeight: 600, height: 40 }}>Gọi ngay</Button>
                <Button variant="contained" size="medium" startIcon={<Message />} sx={{ textTransform: 'none', flex: 1, borderRadius: 999, fontWeight: 600, height: 40 }}>Gửi tin nhắn</Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
                <Button variant="outlined" size="small" startIcon={<Save />} sx={{ textTransform: 'none', borderRadius: 999 }}>Lưu</Button>
              </Stack>
            </Paper>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default InviteDetail;

