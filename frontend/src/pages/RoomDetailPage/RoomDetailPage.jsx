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
  const [loading, setLoading] = useState(true);
  const [similarRooms, setSimilarRooms] = useState([]);
  const [comments, setComments] = useState([]);
  const [myRating, setMyRating] = useState(null);
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('RoomDetailPage - Loading room with ID:', id);

        // Favorites: do NOT read/write localStorage. If authenticated, load favorites from backend; otherwise keep empty in-memory.
        if (accessToken) {
          try {
            const resFav = await FavoriteApi.getMyFavorites();
            const ids = (resFav?.favorites || []).map(f => String(f.room?._id || f.clientRoomId || f.room));
            setFavorites(new Set(ids));
          } catch (err) {
            console.error('Error loading favorites in RoomDetailPage:', err);
            setFavorites(new Set());
          }
        } else {
          setFavorites(new Set());
        }

        // Fetch room details from API
        const foundRoom = await fetchRoomById(id);
        console.log('RoomDetailPage - Found room:', foundRoom);

        if (foundRoom) {
          setRoom(foundRoom);
          const postId = foundRoom?.postId || foundRoom?.post || foundRoom?.id;
          console.log('🔑 PostId for comments/ratings:', postId);
          console.log('📦 Room data:', foundRoom);

          try {
            // Load comments & ratings từ server nếu có postId hợp lệ
            if (postId) {
              console.log('📡 Loading comments and ratings...');
              const cmtPromise = CommentApi.listByPost(postId).catch(e => { console.error('Comments error:', e); return []; });
              const statsPromise = RatingApi.stats(postId).catch(e => { console.error('Stats error:', e); return { average: 0, count: 0 }; });
              const minePromise = accessToken ? RatingApi.me(postId).catch(e => { console.log('Me rating error (OK if not logged in):', e.message); return null; }) : Promise.resolve(null);
              const [cmt, stats, mine] = await Promise.all([cmtPromise, statsPromise, minePromise]);
              console.log('✅ Comments loaded:', cmt);
              console.log('✅ Stats loaded:', stats);
              console.log('✅ My rating loaded:', mine);
              setComments(Array.isArray(cmt) ? cmt : []);
              setRatingStats(stats || { average: 0, count: 0 });
              setMyRating(mine || null);
            } else {
              console.warn('⚠️ No postId found, cannot load comments/ratings');
              setComments([]);
              setRatingStats({ average: 0, count: 0 });
              setMyRating(null);
            }
          } catch (e) {
            console.error('❌ Load comments/ratings failed:', e);
            setComments([]);
            setRatingStats({ average: 0, count: 0 });
            setMyRating(null);
          }

          // Load similar rooms from API
          const allRooms = await fetchAllRooms();
          const similar = allRooms.filter(r => r && r.id !== foundRoom.id).slice(0, 3);
          setSimilarRooms(similar);
        }
        setLoading(false);
      } catch (e) {
        console.error('Error loading room data:', e);
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const toggleFavorite = async () => {
    console.log('❤️ Favorite toggle (header)');
    console.log('🔐 Access token:', accessToken ? 'EXISTS' : 'MISSING');
    if (!accessToken) {
      showToast('Vui lòng đăng nhập để lưu phòng yêu thích.', 'warning');
      return;
    }
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

  if (loading) {
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
        onBack={handleBack}
        onToggleFavorite={toggleFavorite}
      />

      {/* Room Info Card */}
      <RoomInfoCard room={room} ratingStats={ratingStats} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          {/* Image Gallery */}
          <ImageGallery room={room} />

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
          <ReviewsComments
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
          />

          {/* Similar Rooms */}
          <SimilarRooms
            similarRooms={similarRooms}
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
