import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Tabs, Tab, Typography, Card, CardContent, CardMedia, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyPostsAction, deletePostAction } from '../../services/api/postApi';
import { useConfirm } from '../../Components/ConfirmProvider';

function PostCard({ post, onDelete }) {
  const room = post.room || {};
  return (
    <Card sx={{ display: 'flex', mb: 2 }}>
      {room.images && room.images[0] && (
        <CardMedia component="img" sx={{ width: 160 }} image={room.images[0]} alt={post.title} />
      )}
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6">{post.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{post.overviewDescription}</Typography>
        <Typography variant="caption" color="text.secondary">Loại: {post.postType || 'room_rental'}</Typography>
        <Box sx={{ mt: 1 }}>
          <Button size="small" component={Link} to={`/room/${room._id || post._id}`}>Xem chi tiết</Button>
          <Button size="small" component={Link} to={`/user/edit-post/${post._id}`} sx={{ ml: 1 }}>Chỉnh sửa</Button>
          <Button size="small" color="error" onClick={() => onDelete(post._id)} sx={{ ml: 1 }}>Xóa</Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function ManagePostUser() {
  const [tab, setTab] = useState(0); // 0 = all, 1 = rentals, 2 = invite-roommate
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { confirm } = useConfirm();
  const currentUser = useSelector(s => s.auth.login?.currentUser);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!currentUser?._id) {
          if (mounted) setPosts([]);
          return;
        }
        const result = await fetchMyPostsAction(dispatch);
        if (mounted) setPosts(Array.isArray(result.posts) ? result.posts : []);
      } catch (err) {
        console.error('Failed to load user posts', err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [currentUser, dispatch]);

  const handleDelete = async (postId) => {
    const ok = await confirm('Bạn có chắc muốn xóa bài đăng này không?');
    if (!ok) return;
    setLoading(true);
    const res = await deletePostAction(postId, dispatch);
    if (res && res.success) {
      // refresh local posts
      const refreshed = await fetchMyPostsAction(dispatch);
      setPosts(Array.isArray(refreshed.posts) ? refreshed.posts : []);
    } else {
      alert('Xóa thất bại: ' + (res.message || 'Lỗi'));
    }
    setLoading(false);
  };

  // normalize postType to canonical values before filtering
  const normalizeType = (raw) => {
    const s = String(raw || '').toLowerCase().trim();
    const clean = s.replace(/[-_]/g, ' ');
    if (clean === '' ) return 'room_rental';
    if (clean === 'room rental' || clean === 'rental' || clean === 'roomrental' || s === 'room_rental') return 'room_rental';
    if (clean.includes('invite') || clean.includes('roomate') || clean.includes('roommate')) return 'invite roomate';
    return s;
  };

  const rentalPosts = posts.filter(p => normalizeType(p.postType) === 'room_rental');
  const invitePosts = posts.filter(p => normalizeType(p.postType) === 'invite roomate');

  const displayedPosts = tab === 0 ? posts : (tab === 1 ? rentalPosts : invitePosts);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Quản lý tin đăng</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Tất cả (${posts.length})`} />
        <Tab label={`Tin cho thuê (${rentalPosts.length})`} />
        <Tab label={`Tin tìm ở ghép (${invitePosts.length})`} />
      </Tabs>

      {loading && <Typography>Đang tải...</Typography>}
      {error && <Typography color="error">Lỗi khi tải: {String(error.message || error)}</Typography>}

      {!loading && (
        <Box>
          {displayedPosts.length === 0 && <Typography>Chưa có bài đăng nào ở mục này.</Typography>}
          {displayedPosts.map(p => <PostCard key={p._id} post={p} onDelete={handleDelete} />)}
        </Box>
      )}
    </Box>
  );
}
