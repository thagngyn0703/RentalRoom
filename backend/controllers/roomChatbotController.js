const DefaultPost = require('../models/Post');
const DefaultBooking = require('../models/Booking');
const { matchRoomsWithAI: defaultMatchRoomsWithAI } = require('../services/searchAI/aiMatchingService');

const cleanText = (value) => (typeof value === 'string' ? value.trim() : '');

const toRoomResult = (post) => {
  const room = post?.room;
  if (!room?._id) return null;

  return {
    id: String(room._id),
    postId: post._id ? String(post._id) : null,
    title: post.title || 'Phòng trọ',
    description: post.overviewDescription || '',
    price: room.price,
    unit: room.unit || 'VND',
    area: room.area,
    roomType: room.roomType || '',
    address: room.address || '',
    city: room.province || '',
    district: room.district || '',
    ward: room.ward || '',
    utilities: Array.isArray(room.utilities) ? room.utilities : [],
    image: room.images?.[0] || '/logo512.png',
    images: Array.isArray(room.images) ? room.images : [],
    status: room.status || 'available',
    author: post.user?.username || 'Người đăng',
    authorInterests: post.userInfo?.interests || [],
    authorHabits: post.userInfo?.habits || [],
    authorDislikes: post.userInfo?.dislikes || [],
    authorBio: post.userInfo?.bio || '',
    authorAge: post.userInfo?.age || null,
    authorGender: post.userInfo?.gender || null,
    authorProfession: post.userInfo?.profession || '',
  };
};

const toPublicRoomResult = (room, aiReason) => ({
  id: room.id,
  postId: room.postId,
  title: room.title,
  description: room.description,
  price: room.price,
  unit: room.unit,
  area: room.area,
  roomType: room.roomType,
  address: room.address,
  city: room.city,
  district: room.district,
  ward: room.ward,
  utilities: room.utilities,
  image: room.image,
  images: room.images,
  status: room.status,
  author: room.author,
  aiReason,
});

const findAvailablePosts = async (Post, Booking) => {
  const posts = await Post.find({
    status: 'approved',
    postType: 'room_rental',
  })
    .populate('room')
    .populate('user', 'username')
    .populate('userInfo')
    .lean();

  const rooms = posts.map(toRoomResult).filter((room) => room && room.status !== 'rented');
  if (!rooms.length) return [];

  const bookedRoomIds = await Booking.find({
    room: { $in: rooms.map((room) => room.id) },
    status: { $in: ['pending', 'confirmed'] },
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  }).distinct('room');
  const booked = new Set(bookedRoomIds.map(String));
  return rooms.filter((room) => !booked.has(room.id));
};

function createRoomChatbotController({
  Post = DefaultPost,
  Booking = DefaultBooking,
  matchRoomsWithAI = defaultMatchRoomsWithAI,
} = {}) {
  return {
    ask: async (req, res) => {
      const question = cleanText(req.body?.question);
      if (!question || question.length > 500) {
        return res.status(400).json({ success: false, message: 'Câu hỏi phải có từ 1 đến 500 ký tự.' });
      }

      try {
        const availableRooms = await findAvailablePosts(Post, Booking);
        if (!availableRooms.length) {
          return res.json({
            success: true,
            answer: 'Hiện chưa có phòng trống phù hợp để tôi tìm giúp bạn.',
            rooms: [],
            canCreateTicket: true,
            aiMessage: null,
            aiStats: { totalRooms: 0, matchedRooms: 0 },
          });
        }

        const aiResult = await matchRoomsWithAI(availableRooms, question);
        const roomById = new Map(availableRooms.map((room) => [room.id, room]));
        const rooms = aiResult?.success && Array.isArray(aiResult.matchedIds)
          ? aiResult.matchedIds
            .map((match) => {
              const room = roomById.get(String(match.id));
              return room ? toPublicRoomResult(room, match.reason) : null;
            })
            .filter(Boolean)
            .slice(0, 6)
          : [];

        return res.json({
          success: true,
          answer: rooms.length
            ? `Tôi tìm thấy ${rooms.length} phòng có khả năng phù hợp với yêu cầu của bạn.`
            : (aiResult?.message || 'Chưa tìm thấy phòng phù hợp. Bạn thử mô tả thêm ngân sách, khu vực hoặc tiện ích nhé.'),
          rooms,
          canCreateTicket: rooms.length === 0,
          aiMessage: aiResult?.message || null,
          aiStats: aiResult?.stats || { totalRooms: availableRooms.length, matchedRooms: rooms.length },
        });
      } catch (error) {
        console.error('room chatbot error:', error);
        return res.status(503).json({
          success: false,
          message: 'Trợ lý tìm phòng tạm thời không khả dụng. Vui lòng thử lại sau.',
        });
      }
    },
  };
}

module.exports = { createRoomChatbotController, roomChatbotController: createRoomChatbotController() };
