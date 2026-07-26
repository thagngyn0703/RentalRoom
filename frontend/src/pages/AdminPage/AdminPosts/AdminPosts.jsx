
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Button, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel } from '@mui/material';
import { fetchAllRooms } from '../../../services/api/postApi';
import axiosJWT from '../../../config/axiosJWT';

function AdminPostCard({ post, onToggleStatus, onView }) {
  const statusActive = post.status !== 'rejected';
  return (
    <Card sx={{ display: 'flex', mb: 2 }}>
      {post.images && post.images[0] && (
        <CardMedia component="img" sx={{ width: 160 }} image={post.images[0]} alt={post.title} />
      )}
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6">{post.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{post.description}</Typography>
        <Typography variant="caption" color="text.secondary">Loại: {post.postType || 'room_rental'}</Typography>
        <Box sx={{ mt: 1 }}>
          <Button size="small" onClick={() => onView(post)}>Xem nội dung</Button>
          <FormControlLabel
            control={<Switch checked={statusActive} onChange={() => onToggleStatus(post)} color="primary" />}
            label={statusActive ? 'Hoạt động' : 'Ẩn'}
            sx={{ ml: 2 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

const AdminPosts = () => {
  const [tab, setTab] = useState(0); // 0 = all, 1 = rentals, 2 = invite-roommate
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewPost, setViewPost] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const rooms = await fetchAllRooms();
        if (mounted) setPosts(Array.isArray(rooms) ? rooms : []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Normalize postType for filtering
  const normalizeType = (raw) => {
    const s = String(raw || '').toLowerCase().trim();
    const clean = s.replace(/[-_]/g, ' ');
    if (clean === '') return 'room_rental';
    if (clean === 'room rental' || clean === 'rental' || clean === 'roomrental' || s === 'room_rental') return 'room_rental';
    if (clean.includes('invite') || clean.includes('roomate') || clean.includes('roommate')) return 'invite roomate';
    return s;
  };

  const rentalPosts = posts.filter(p => normalizeType(p.postType) === 'room_rental');
  const invitePosts = posts.filter(p => normalizeType(p.postType) === 'invite roomate');
  const displayedPosts = tab === 0 ? posts : (tab === 1 ? rentalPosts : invitePosts);

  // Toggle post status between active and rejected
  const handleToggleStatus = async (post) => {
    const newStatus = post.status === 'rejected' ? 'pending' : 'rejected';
    try {
      setLoading(true);
      await axiosJWT.put(`/api/posts/${post.postId}`, { status: newStatus });
      // Refresh posts
      const rooms = await fetchAllRooms();
      setPosts(Array.isArray(rooms) ? rooms : []);
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái: ' + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Quản lý bài đăng</Typography>
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
          {displayedPosts.map(p => (
            <AdminPostCard
              key={p.id}
              post={p}
              onToggleStatus={handleToggleStatus}
              onView={setViewPost}
            />
          ))}
        </Box>
      )}

      {/* Dialog to view post content */}
      <Dialog open={!!viewPost} onClose={() => setViewPost(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Nội dung bài đăng</DialogTitle>
        <DialogContent dividers>
          {viewPost && (
            <>
              <Typography variant="h6">{viewPost.title}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>{viewPost.description}</Typography>
              <Typography variant="caption">Loại: {viewPost.postType}</Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>Địa chỉ: {viewPost.address}, {viewPost.district}, {viewPost.city}</Typography>
              <Typography variant="body2">Giá: {viewPost.price} {viewPost.unit}</Typography>
              <Typography variant="body2">Diện tích: {viewPost.area} m²</Typography>
              <Typography variant="body2">Tiện ích: {(viewPost.utilities || []).join(', ')}</Typography>
              <Typography variant="body2">Ghi chú: {viewPost.notes}</Typography>
              <Typography variant="body2">Trạng thái: {viewPost.status}</Typography>
              <Typography variant="body2">Người đăng: {viewPost.author} ({viewPost.phone})</Typography>
              <Box sx={{ mt: 2 }}>
                {(viewPost.images || []).map((img, idx) => (
                  <img key={idx} src={img} alt="img" style={{ maxWidth: 120, marginRight: 8 }} />
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewPost(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPosts;