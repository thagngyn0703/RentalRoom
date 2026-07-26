import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Rating,
  Avatar,
  
  Card,
  CardContent,
  Grid,
  
  IconButton
} from '@mui/material';
import {
  ArrowBack,
  Star,
 
  ThumbUp,
  ThumbUpOutlined,
  Close
} from '@mui/icons-material';
import { CommentApi } from '../../services/api/commentApi';
import { RatingApi } from '../../services/api/ratingApi';
import { fetchRoomById } from '../../services/api/postApi';

const RoomReviewsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    name: 'Anonymous'
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Sample reviews data
 

  useEffect(() => {
    const loadData = async () => {
      try {
        const foundRoom = await fetchRoomById(id);
        if (foundRoom) {
          setRoom(foundRoom);
          const postId = foundRoom?.postId || foundRoom?.post || foundRoom?.id;
          try {
            const [comments, stats] = await Promise.all([
              CommentApi.listByPost(postId),
              RatingApi.stats(postId)
            ]);
            // Map comments -> reviews model for this page
            const mapped = (comments || []).map(c => ({
              id: c._id,
              name: c.user?.username || 'User',
              avatar: (c.user?.username || 'U').slice(0,1).toUpperCase(),
              rating: 0,
              comment: c.content,
              date: new Date(c.createdAt).toLocaleString('vi-VN'),
              likes: 0,
              liked: false,
              media: []
            }));
            setReviews(mapped);
            setRatingStats(stats || { average: 0, count: 0 });
          } catch (e) {
            console.error('Failed to load comments/ratings:', e);
            setReviews([]);
            setRatingStats({ average: 0, count: 0 });
          }
        }
      } catch (e) {
        console.error('Error loading room:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    const onRating = async () => {
      try {
        const postId = (room?.postId || room?.post || id);
        if (postId) {
          const stats = await RatingApi.stats(postId);
          setRatingStats(stats || { average: 0, count: 0 });
        }
      } catch (_) {}
    };
    window.addEventListener('ratingUpdated', onRating);
    return () => window.removeEventListener('ratingUpdated', onRating);
  }, [id, room]);

  const handleRatingChange = (event, newValue) => {
    setNewReview({ ...newReview, rating: newValue });
  };

  const handleCommentChange = (event) => {
    setNewReview({ ...newReview, comment: event.target.value });
  };

  const handleMediaUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const isValidImage = file.type.startsWith('image/');
      const isValidVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return (isValidImage || isValidVideo) && isValidSize;
    });

    const newMediaFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      url: URL.createObjectURL(file),
      name: file.name
    }));

    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  };

  const handleRemoveMedia = (mediaId) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(media => media.id === mediaId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(media => media.id !== mediaId);
    });
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  const handleSubmitReview = () => {
    console.log('Submit review clicked');
    console.log('Comment:', newReview.comment);
    console.log('Media files:', mediaFiles);
    
    if (newReview.comment.trim() || mediaFiles.length > 0) {
      console.log('Submitting review...');
      const review = {
        id: Date.now(), // Use timestamp as unique ID
        name: newReview.name || 'Anonymous',
        avatar: (newReview.name || 'Anonymous').charAt(0).toUpperCase(),
        rating: newReview.rating,
        comment: newReview.comment || 'Đã đính kèm ảnh/video',
        date: 'Hôm nay ' + new Date().toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        likes: 0,
        liked: false,
        media: mediaFiles.map(media => ({
          id: media.id,
          type: media.type,
          url: media.url,
          name: media.name
        }))
      };
      
      console.log('New review:', review);
      
      const updatedReviews = [review, ...reviews];
      setReviews(updatedReviews);
      
      // Save to localStorage
      localStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews));
      
      // Reset form
      setNewReview({ rating: 5, comment: '', name: 'Anonymous' });
      setMediaFiles([]);
      
      console.log('Review submitted successfully!');
    } else {
      console.log('Cannot submit: no comment and no media files');
    }
  };

  const handleLikeReview = (reviewId) => {
    const updatedReviews = reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          liked: !review.liked,
          likes: review.liked ? review.likes - 1 : review.likes + 1
        };
      }
      return review;
    });
    
    setReviews(updatedReviews);
    
    // Save to localStorage
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews));
  };

  const getOverallRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    if (ratingStats && ratingStats.distribution) {
      return { 5: ratingStats.distribution[5] || 0, 4: ratingStats.distribution[4] || 0, 3: ratingStats.distribution[3] || 0, 2: ratingStats.distribution[2] || 0, 1: ratingStats.distribution[1] || 0 };
    }
    // fallback tính từ reviews nếu không có stats
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => { distribution[review.rating]++; });
    return distribution;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!room) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Không tìm thấy phòng trọ</Typography>
      </Container>
    );
  }

  const ratingDistribution = getRatingDistribution();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <IconButton onClick={() => navigate(`/room/${id}`)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Đánh Giá & Xếp Hạng
          </Typography>
        </Stack>
        
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            {room.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {room.location?.address || room.address}
          </Typography>
        </Paper>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content - Reviews */}
        <Grid item xs={12}>
          {/* Overall Rating */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {Number(ratingStats.average || 0).toFixed(1)}
                </Typography>
                <Rating value={Number(ratingStats.average || 0)} readOnly size="large" precision={0.5} />
                <Typography variant="body2" color="text.secondary">
                  {ratingStats.count} đánh giá
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                {[5, 4, 3, 2, 1].map((star) => (
                  <Stack key={star} direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 20 }}>
                      {star}
                    </Typography>
                    <Star sx={{ color: 'text.secondary', fontSize: 16 }} />
                    <Box sx={{ flex: 1, height: 8, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                      <Box 
                        sx={{ 
                          height: '100%', 
                          bgcolor: 'primary.main',
                          width: `${reviews.length > 0 ? (ratingDistribution[star] / reviews.length) * 100 : 0}%`
                        }} 
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 30 }}>
                      {ratingDistribution[star]}
                    </Typography>
                  </Stack>
                ))}
              </Box>
            </Stack>
          </Paper>

          {/* Write Review removed on view-all page */}

          {/* Reviews List */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Tất Cả Đánh Giá ({reviews.length})
          </Typography>
          
          <Stack spacing={2}>
            {reviews.map((review) => (
              <Card key={review.id} variant="outlined">
                <CardContent>
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {review.avatar}
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {review.name}
                        </Typography>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {review.date}
                        </Typography>
                      </Stack>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {review.comment}
                      </Typography>
                      
                      {/* Media Display */}
                      {review.media && review.media.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Grid container spacing={1}>
                            {review.media.map((media) => (
                              <Grid item xs={6} sm={4} md={3} key={media.id}>
                                <Box sx={{ position: 'relative' }}>
                                  {media.type === 'image' ? (
                                    <img
                                      src={media.url}
                                      alt={media.name}
                                      style={{
                                        width: '100%',
                                        height: 120,
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                        border: '1px solid #e0e0e0',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => handleImageClick(media.url)}
                                    />
                                  ) : (
                                    <video
                                      src={media.url}
                                      style={{
                                        width: '100%',
                                        height: 120,
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                        border: '1px solid #e0e0e0'
                                      }}
                                      controls
                                    />
                                  )}
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                      
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleLikeReview(review.id)}
                          color={review.liked ? 'primary' : 'default'}
                        >
                          {review.liked ? <ThumbUp /> : <ThumbUpOutlined />}
                        </IconButton>
                        <Typography variant="caption" color="text.secondary">
                          {review.likes} lượt thích
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>

      </Grid>
      
      {/* Image Viewer Modal */}
      {selectedImage && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            p: 2
          }}
          onClick={handleCloseImage}
        >
          <Box
            sx={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Full size"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 8
              }}
            />
            <IconButton
              onClick={handleCloseImage}
              sx={{
                position: 'absolute',
                top: -40,
                right: -40,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                color: 'black',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 1)'
                }
              }}
              size="large"
            >
              <Close />
            </IconButton>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default RoomReviewsPage;
