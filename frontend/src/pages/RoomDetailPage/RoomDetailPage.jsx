import { useEffect, useState } from 'react';
import { FavoriteApi } from '../../services/api';
import { fetchRoomById, fetchAllRooms } from '../../services/api/postApi';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid } from '@mui/material';
import { CommentApi } from '../../services/api/commentApi';
import { RatingApi } from '../../services/api/ratingApi';
import { useSelector } from 'react-redux';
import { useToast } from '../../Components/ToastProvider';
import HomeIcon from '@mui/icons-material/Home';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ChatModal from '../../Components/Chat/ChatModal';

// Import components
import RoomHeader from './components/RoomHeader/RoomHeader';
import RoomInfoCard from './components/RoomInfoCard/RoomInfoCard';
import ImageGallery from './components/ImageGallery/ImageGallery';
import UtilitiesFurniture from './components/UtilitiesFurniture/UtilitiesFurniture';
import CostDetails from './components/CostDetails/CostDetails';
import Description from './components/Description/Description';
import ReviewsComments from './components/ReviewsComments/ReviewsComments';
import SimilarRooms from './components/SimilarRooms/SimilarRooms';
import MapLocation from './components/MapLocation/MapLocation';

const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const accessToken = useSelector((s) => s?.auth?.login?.accessToken);
  const currentUser = useSelector((s) => s?.auth?.login?.currentUser);
  const { showToast } = useToast();
  const [room, setRoom] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [favoritesLoading, setFavoritesLoading] = useState(Boolean(accessToken));
  const [loading, setLoading] = useState(true);
  const [similarRooms, setSimilarRooms] = useState([]);
  const [comments, setComments] = useState([]);
  const [myRating, setMyRating] = useState(null);
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setFavorites(new Set());
    setFavoritesLoading(Boolean(accessToken));
    if (accessToken) {
      FavoriteApi.getMyFavorites().then(res => {
        if (active) setFavorites(new Set((res?.favorites || []).map(f => String(f.room?._id || f.clientRoomId || f.room))));
      }).catch(err => console.error('Error loading favorites:', err))
        .finally(() => { if (active) setFavoritesLoading(false); });
    }
    return () => { active = false; };
  }, [accessToken]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setRoom(null);
    setSimilarRooms([]);
    setChatOpen(false);
    const loadRoom = async () => {
      try {
        const foundRoom = await fetchRoomById(id);
        if (!active) return;
        setRoom(foundRoom);
        setLoading(false);
        if (foundRoom) {
          fetchAllRooms({ limit: 4 }).then(rooms => {
            if (active) setSimilarRooms(rooms.filter(r => r && String(r.id) !== String(foundRoom.id)).slice(0, 3));
          }).catch(err => console.error('Error loading similar rooms:', err));
        }
      } catch (err) {
        console.error('Error loading room:', err);
        if (active) setLoading(false);
      }
    };
    loadRoom();
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    let active = true;
    setReviewsLoading(true);
    setComments([]);
    setRatingStats({ average: 0, count: 0 });
    setMyRating(null);
    const postId = room?.postId || room?.post || room?.id;
    if (postId && String(room.id) === String(id)) {
      const commentsRequest = CommentApi.listByPost(postId).then(value => {
        if (active) setComments(Array.isArray(value) ? value : []);
      }).catch(err => console.error('Error loading comments:', err));
      const statsRequest = RatingApi.stats(postId).then(value => {
        if (active) setRatingStats(value || { average: 0, count: 0 });
      }).catch(err => console.error('Error loading rating stats:', err));
      const mineRequest = accessToken ? RatingApi.me(postId).then(value => {
        if (active) setMyRating(value || null);
      }).catch(err => console.error('Error loading my rating:', err)) : Promise.resolve();
      Promise.all([commentsRequest, statsRequest, mineRequest]).then(() => {
        if (active) setReviewsLoading(false);
      });
    }
    return () => { active = false; };
  }, [room, id, accessToken]);

  const toggleFavorite = async () => {
    console.log('❤️ Favorite toggle (header)');
    console.log('🔐 Access token:', accessToken ? 'EXISTS' : 'MISSING');
    if (!accessToken) {
      showToast('Vui lòng đăng nhập để lưu phòng yêu thích.', 'warning');
      return;
    }
    if (favoritesLoading) return;
    const MAX_FAVORITES = 20;
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
      try { await FavoriteApi.removeFavorite(id); } catch (_) { }
    } else {
      if (newFavorites.size >= MAX_FAVORITES) {
        try { showToast(`Bạn chỉ có thể lưu tối đa ${MAX_FAVORITES} phòng yêu thích.`, 'warning'); } catch (_) { }
        return;
      }
      newFavorites.add(id);
      try { await FavoriteApi.addFavorite(id); } catch (_) { }
    }
    setFavorites(newFavorites);
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleChatClick = () => {
    if (!accessToken) {
      showToast('Vui lòng đăng nhập để chat với chủ phòng.', 'warning');
      return;
    }
    setChatOpen((prev) => !prev);
  };

  if (loading || (room && String(room.id) !== String(id))) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (!room) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Không tìm thấy phòng trọ</Typography>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          Quay lại
        </Button>
      </Box>
    );
  }

  const isFavorite = favorites.has(String(room.id));

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <RoomHeader
        room={room}
        isFavorite={isFavorite}
        favoritesLoading={favoritesLoading}
        onBack={handleBack}
        onToggleFavorite={toggleFavorite}
      />

      {/* Room Info Card */}
      <RoomInfoCard room={room} ratingStats={ratingStats} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          {/* Image Gallery */}
          <ImageGallery key={room.id} room={room} />

          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => navigate(`/user/rent-room/${room.id}`)}
              sx={{ textTransform: 'none', fontWeight: 600, py: 1.5, px: 3 }}
            >
              Thuê phòng ngay
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<ChatBubbleOutlineIcon />}
              onClick={handleChatClick}
              sx={{ textTransform: 'none', fontWeight: 600, py: 1.5, px: 3 }}
            >
              Chat với chủ phòng
            </Button>
          </Box>

          {/* Utilities & Furniture */}
          <UtilitiesFurniture utilities={room.utilities} />

          {/* Cost Details */}
          <CostDetails room={room} />

          {/* Description */}
          <Description description={room.description} />

          {/* Reviews & Comments */}
          {reviewsLoading ? <Typography sx={{ mb: 3 }}>Đang tải đánh giá và bình luận...</Typography> : <ReviewsComments
            key={room.id}
            room={room}
            comments={comments}
            setComments={setComments}
            myRating={myRating}
            setMyRating={setMyRating}
            ratingStats={ratingStats}
            setRatingStats={setRatingStats}
            accessToken={accessToken}
            currentUser={currentUser}
            showToast={showToast}
          />}

          {/* Similar Rooms */}
          <SimilarRooms
            similarRooms={similarRooms}
            favoritesLoading={favoritesLoading}
            favorites={favorites}
            setFavorites={setFavorites}
            accessToken={accessToken}
            showToast={showToast}
            FavoriteApi={FavoriteApi}
          />

          {/* Map Location */}
          <MapLocation room={room} />
        </Grid>
      </Grid>

      {/* Real-time Chat Modal */}
      <ChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        ownerId={room?.userId || room?.user?._id || room?.user}
        roomId={room?.id || room?._id}
        currentUser={currentUser}
        showToast={showToast}
      />
    </Box>
  );
};

export default RoomDetailPage;
