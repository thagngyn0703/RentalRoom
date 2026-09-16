import { useState } from 'react';
import { Paper, Stack, Typography, Rating as MuiRating, Avatar, Box, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CommentApi } from '../../../../services/api/commentApi';
import { RatingApi } from '../../../../services/api/ratingApi';

const ReviewsComments = ({ 
  room, 
  comments, 
  setComments, 
  myRating, 
  setMyRating, 
  ratingStats, 
  setRatingStats, 
  accessToken,
  currentUser,
  showToast 
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyFor, setReplyFor] = useState(null);
  const [editFor, setEditFor] = useState(null);
  const [editText, setEditText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const currentUserId = String(currentUser?._id || currentUser?.id || '');

  const submitComment = async () => {
    console.log('💬 Comment submit triggered');
    console.log('📝 Comment content:', newComment);
    if (!newComment.trim()) {
      console.warn('⚠️ Empty comment');
      return;
    }
    console.log('🔐 Access token:', accessToken ? 'EXISTS' : 'MISSING');
    if (!accessToken) {
      console.warn('⚠️ No access token, need login');
      showToast('Vui lòng đăng nhập để bình luận', 'warning');
      return;
    }
    try {
      const postId = room?.postId || room?.post || room?.id;
      console.log('📤 Sending comment for postId:', postId);
      const c = await CommentApi.create(postId, { content: newComment });
      console.log('✅ Comment created:', c);
      setComments((prev) => [c, ...prev]);
      setNewComment('');
      try { 
        const stats = await RatingApi.stats(postId); 
        setRatingStats(stats); 
      } catch (_) {}
    } catch (e) {
      console.error('❌ Comment failed:', e);
      showToast('Lỗi khi gửi bình luận: ' + e.message, 'error');
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2, overflowWrap: 'anywhere' }}>
      <Stack direction="row" alignItems="center" spacing={2} useFlexGap sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mr: 'auto' }}>
          Đánh giá & Bình luận
        </Typography>
        <MuiRating
          value={myRating?.stars || 0}
          precision={1}
          onChange={async (_e, val) => {
            console.log('⭐ Rating changed to:', val);
            console.log('🔐 Access token:', accessToken ? 'EXISTS' : 'MISSING');
            if (!accessToken) { 
              console.warn('⚠️ No access token, need login');
              showToast('Vui lòng đăng nhập để đánh giá', 'warning'); 
              return; 
            }
            try {
              const postId = room?.postId || room?.post || room?.id;
              console.log('📤 Sending rating for postId:', postId);
              const saved = await RatingApi.upsert(postId, { stars: val, review: '' });
              console.log('✅ Rating saved:', saved);
              setMyRating(saved);
              const stats = await RatingApi.stats(postId);
              console.log('✅ Stats updated:', stats);
              setRatingStats(stats);
              try { window.dispatchEvent(new Event('ratingUpdated')); } catch (_) {}
            } catch (e) {
              console.error('❌ Rating failed:', e);
              showToast('Lỗi khi lưu đánh giá: ' + e.message, 'error');
            }
          }}
        />
        <Typography variant="body2" color="text.secondary">
          Trung bình: {Number(ratingStats.average).toFixed(1)} ({ratingStats.count})
        </Typography>
      </Stack>

      {/* Form nhập comment */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Avatar>{(room.author || 'N').charAt(0)}</Avatar>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => { 
              if (e.key === 'Enter') { 
                e.preventDefault(); 
                submitComment(); 
              } 
            }}
            placeholder="Viết bình luận..."
            style={{ 
              flex: '1 1 180px', minWidth: 0,
              padding: 10, 
              borderRadius: 8, 
              border: '1px solid #e0e0e0' 
            }}
          />
          <Button 
            variant="contained" 
            onClick={submitComment}
            sx={{ textTransform: 'none' }}
          >
            Gửi
          </Button>
          <Button
            variant="text"
            onClick={() => setShowAllComments((s) => !s)}
            sx={{ textTransform: 'none' }}
          >
            {showAllComments ? 'Ẩn bớt' : 'Xem tất cả'}
          </Button>
        </Box>
      </Stack>

      {/* Danh sách comments */}
      <Stack spacing={1.5}>
        {(showAllComments ? comments : comments.slice(0, 2)).map((c) => {
          const isCommentOwner = String(c.user?._id || c.user?.id || c.user || '') === currentUserId;
          return (
          <Box key={c._id}>
            <Stack direction="row" spacing={1}>
              <Avatar>{(c.user?.username || 'U').charAt(0)}</Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" useFlexGap sx={{ flexWrap: 'wrap' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {c.user?.username || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(c.createdAt).toLocaleString()}
                  </Typography>
                </Stack>
                {editFor?.id === c._id ? (
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={{ 
                        flex: 1, minWidth: 0,
                        padding: 8, 
                        borderRadius: 8, 
                        border: '1px solid #e0e0e0' 
                      }}
                    />
                    <Button size="small" onClick={async () => {
                      try {
                        const updated = await CommentApi.update(c._id, { content: editText });
                        setComments((prev) => prev.map(x => x._id === c._id ? { ...x, content: updated.content, isEdited: true } : x));
                        setEditFor(null);
                        setEditText('');
                      } catch (_) {}
                    }}>Lưu</Button>
                    <Button size="small" color="inherit" onClick={() => { 
                      setEditFor(null); 
                      setEditText(''); 
                    }}>Hủy</Button>
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {c.content}
                  </Typography>
                )}
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.25 }}>
                  <Button 
                    size="small" 
                    variant="text" 
                    onClick={() => setReplyFor(replyFor === c._id ? null : c._id)} 
                    sx={{ textTransform: 'none', minWidth: 'auto', px: 0.5 }}
                  >
                    Trả lời
                  </Button>
                  {isCommentOwner && (
                    <Button 
                      size="small" 
                      variant="text" 
                      onClick={() => { 
                        setEditFor({ id: c._id }); 
                        setEditText(c.content); 
                      }} 
                      sx={{ textTransform: 'none', minWidth: 'auto', px: 0.5 }}
                    >
                      Sửa
                    </Button>
                  )}
                  <Button 
                    size="small" 
                    color="error" 
                    variant="text" 
                    onClick={async () => {
                      try { 
                        await CommentApi.remove(c._id); 
                        setComments((prev) => prev.filter(x => x._id !== c._id)); 
                      } catch (_) {}
                    }} 
                    sx={{ textTransform: 'none', minWidth: 'auto', px: 0.5 }}
                  >
                    Xóa
                  </Button>
                </Stack>
                
                {/* Replies */}
                {Array.isArray(c.replies) && c.replies.length > 0 && (
                  <Stack spacing={1} sx={{ mt: 1, pl: 5 }}>
                    {c.replies.map((r) => (
                      <Stack direction="row" spacing={1} key={r._id}>
                        <Avatar>{(r.user?.username || 'U').charAt(0)}</Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="center" useFlexGap sx={{ flexWrap: 'wrap' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {r.user?.username || 'User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(r.createdAt).toLocaleString()}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {r.content}
                          </Typography>
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                )}
                
                {/* Form trả lời */}
                {replyFor === c._id && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1, pl: 5 }}>
                    <input
                      placeholder="Trả lời..."
                      value={editFor?.id === `reply-${c._id}` ? editText : ''}
                      onChange={(e) => { 
                        if (editFor?.id === `reply-${c._id}`) 
                          setEditText(e.target.value); 
                        else { 
                          setEditFor({ id: `reply-${c._id}` }); 
                          setEditText(e.target.value); 
                        } 
                      }}
                      onKeyDown={async (ev) => {
                        if (ev.key === 'Enter') {
                          const val = (editFor?.id === `reply-${c._id}` ? editText : ev.currentTarget.value).trim();
                          if (!val) return;
                          if (!accessToken) { 
                            showToast('Vui lòng đăng nhập để trả lời', 'warning'); 
                            return; 
                          }
                          try {
                            const postId = room?.postId || room?.post || room?.id;
                            const reply = await CommentApi.create(postId, { 
                              content: val, 
                              parent: c._id 
                            });
                            setComments((prev) => prev.map(x => x._id === c._id ? { 
                              ...x, 
                              replies: [...(x.replies||[]), reply] 
                            } : x));
                            setEditText('');
                            setEditFor(null);
                            setReplyFor(null);
                          } catch (_) {}
                        }
                      }}
                      style={{ 
                        flex: 1, minWidth: 0,
                        padding: 8, 
                        borderRadius: 8, 
                        border: '1px solid #e0e0e0' 
                      }}
                    />
                  </Stack>
                )}
              </Box>
            </Stack>
          </Box>
        );
        })}
      </Stack>
      {!showAllComments && comments.length > 2 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Button
            size="small"
            variant="text"
            endIcon={<ExpandMoreIcon />}
            onClick={() => setShowAllComments(true)}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Còn bình luận khác
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ReviewsComments;
