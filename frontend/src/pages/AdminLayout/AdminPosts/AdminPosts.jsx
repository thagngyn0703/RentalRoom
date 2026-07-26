

import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Button, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import { fetchAllPostsAdmin, deletePost } from '../../../services/api/postApi';
import axiosJWT from '../../../config/axiosJWT';
import { useConfirm } from '../../../Components/ConfirmProvider';

function AdminPostCard({ post, onToggleStatus, onView, onDelete, deletingId }) {
  const statusActive = post.status !== 'rejected';
  const isDeleting = deletingId === post.postId;
  return (
    <Card sx={{ display: 'flex', mb: 2 }}>
      {(post.images && post.images[0]) ? (
        <CardMedia component="img" sx={{ width: 160 }} image={post.images[0]} alt={post.title} />
      ) : (
        <Box sx={{ width: 160, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" color="text.secondary">Không ảnh</Typography>
        </Box>
      )}
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6">{post.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{post.description || '—'}</Typography>
        <Typography variant="caption" color="text.secondary">Loại: {post.postType || 'room_rental'} · Trạng thái: {post.status}</Typography>
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Button size="small" variant="outlined" onClick={() => onView(post)}>Xem nội dung</Button>
          <FormControlLabel
            control={<Switch checked={statusActive} onChange={() => onToggleStatus(post)} color="primary" />}
            label={statusActive ? 'Hiển thị' : 'Ẩn'}
          />
          <Button size="small" variant="outlined" color="error" onClick={() => onDelete(post)} disabled={isDeleting}>
            {isDeleting ? 'Đang xóa...' : 'Xóa bài'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

const AdminPosts = () => {
  const { confirm } = useConfirm();
  const [tab, setTab] = useState(0); // 0 = all, 1 = rentals, 2 = invite-roommate
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewPost, setViewPost] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAllPostsAdmin();
      setPosts(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
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

  // Pagination (frontend only)
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [tab, posts.length]); // reset page khi đổi tab hoặc data
  const totalPages = Math.max(1, Math.ceil(displayedPosts.length / PAGE_SIZE));
  const pagedPosts = displayedPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Toggle post status (pending <-> rejected) qua API admin
  const handleToggleStatus = async (post) => {
    if (!post.postId) return;
    try {
      setLoading(true);
      await axiosJWT.put(`/api/posts/${post.postId}/change-status`);
      await loadPosts();
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái: ' + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Xóa bài đăng (admin)
  const handleDelete = async (post) => {
    if (!post.postId) return;
    const ok = await confirm({
      title: 'Xác nhận xóa bài',
      message: `Bạn có chắc muốn xóa bài "${post.title}"? Phòng và bài đăng sẽ bị xóa vĩnh viễn.`,
      confirmText: 'Xóa',
    });
    if (!ok) return;
    try {
      setDeletingId(post.postId);
      await deletePost(post.postId);
      alert('Đã xóa bài đăng.');
      await loadPosts();
    } catch (err) {
      alert('Lỗi khi xóa: ' + (err?.response?.data?.message || err.message));
    } finally {
      setDeletingId(null);
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
          {pagedPosts.length === 0 && <Typography>Chưa có bài đăng nào ở mục này.</Typography>}
          {pagedPosts.map(p => (
            <AdminPostCard
              key={p.postId || p.id}
              post={p}
              onToggleStatus={handleToggleStatus}
              onView={setViewPost}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          ))}
          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
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
              <Typography variant="body2" sx={{ mt: 2 }}>Địa chỉ: {viewPost.address || '—'}, {viewPost.district || '—'}, {viewPost.city || '—'}</Typography>
              <Typography variant="body2">Giá: {viewPost.price != null ? Number(viewPost.price).toLocaleString('vi-VN') : '—'} {viewPost.unit || 'VND'}</Typography>
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