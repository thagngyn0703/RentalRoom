const CheckoutRequest = require('../models/CheckoutRequest');
const Booking = require('../models/Booking');
const Wallet = require('../models/Wallet');
const HistoryBanking = require('../models/HistoryBanking');
const Room = require('../models/Room');

// Khách hàng: tạo yêu cầu trả phòng
exports.createCheckoutRequest = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { bookingId, note } = req.body || {};
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Thiếu bookingId' });
    }

    const booking = await Booking.findOne({ _id: bookingId, user: userId, status: 'confirmed' })
      .populate('room');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking không tồn tại hoặc không thuộc về bạn' });
    }

    const existing = await CheckoutRequest.findOne({
      booking: bookingId,
      status: { $in: ['pending_owner', 'pending_admin'] },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Bạn đã có yêu cầu trả phòng đang chờ xử lý' });
    }

    const request = await CheckoutRequest.create({
      booking: bookingId,
      user: userId,
      note: note || '',
      status: 'pending_owner',
    });

    return res.json({
      success: true,
      message: 'Yêu cầu trả phòng đã được gửi',
      request,
    });
  } catch (err) {
    console.error('createCheckoutRequest error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Khách hàng: danh sách yêu cầu trả phòng của mình
exports.getMyCheckoutRequests = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const requests = await CheckoutRequest.find({ user: userId })
      .populate({ path: 'booking', populate: { path: 'room' } })
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    console.error('getMyCheckoutRequests error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Chủ trọ: danh sách yêu cầu trả phòng của các phòng mình (chỉ những yêu cầu đang chờ chủ trọ)
exports.getOwnerCheckoutRequests = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const roomIds = await Room.find({ user: ownerId }).distinct('_id');
    if (!roomIds.length) return res.json({ success: true, requests: [] });

    const bookingIds = await Booking.find({ room: { $in: roomIds } }).distinct('_id');

    const requests = await CheckoutRequest.find({
      booking: { $in: bookingIds },
      // Trả về các yêu cầu mà chủ trọ có thể đã xử lý (không làm biến mất request sau khi confirm)
      status: { $in: ['pending_owner', 'pending_admin', 'confirmed', 'rejected_owner'] },
    })
      .populate('user', 'username email')
      .populate({
        path: 'booking',
        populate: [{ path: 'room' }, { path: 'user', select: 'username email' }],
      })
      .sort({ createdAt: -1 });

    return res.json({ success: true, requests });
  } catch (err) {
    console.error('getOwnerCheckoutRequests error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Chủ trọ: xác nhận yêu cầu trả phòng (sau đó admin mới thấy)
exports.ownerApproveCheckoutRequest = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { requestId } = req.params;
    const { ownerNote } = req.body || {};

    const request = await CheckoutRequest.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Yêu cầu không tồn tại' });
    if (request.status !== 'pending_owner') {
      return res.status(400).json({ success: false, message: 'Yêu cầu không còn ở trạng thái chờ chủ trọ' });
    }

    const booking = await Booking.findById(request.booking).populate('room');
    if (!booking || !booking.room) return res.status(404).json({ success: false, message: 'Booking/Room không tồn tại' });
    const roomOwnerId = booking.room.user?._id ? String(booking.room.user._id) : String(booking.room.user);
    if (String(roomOwnerId) !== String(ownerId)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xác nhận yêu cầu này' });
    }

    request.status = 'pending_admin';
    request.ownerApprovedBy = ownerId;
    request.ownerApprovedAt = new Date();
    request.ownerNote = ownerNote || '';
    await request.save();

    return res.json({ success: true, message: 'Chủ trọ đã xác nhận. Admin sẽ tiếp tục xác nhận và hoàn cọc.', request });
  } catch (err) {
    console.error('ownerApproveCheckoutRequest error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Chủ trọ: từ chối yêu cầu
exports.ownerRejectCheckoutRequest = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { requestId } = req.params;
    const { ownerNote } = req.body || {};

    const request = await CheckoutRequest.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Yêu cầu không tồn tại' });
    if (request.status !== 'pending_owner') {
      return res.status(400).json({ success: false, message: 'Yêu cầu không còn ở trạng thái chờ chủ trọ' });
    }

    const booking = await Booking.findById(request.booking).populate('room');
    if (!booking || !booking.room) return res.status(404).json({ success: false, message: 'Booking/Room không tồn tại' });
    const roomOwnerId = booking.room.user?._id ? String(booking.room.user._id) : String(booking.room.user);
    if (String(roomOwnerId) !== String(ownerId)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xử lý yêu cầu này' });
    }

    request.status = 'rejected_owner';
    request.ownerApprovedBy = ownerId;
    request.ownerApprovedAt = new Date();
    request.ownerNote = ownerNote || '';
    await request.save();

    return res.json({ success: true, message: 'Đã từ chối yêu cầu trả phòng', request });
  } catch (err) {
    console.error('ownerRejectCheckoutRequest error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: lấy tất cả yêu cầu trả phòng
exports.getAllCheckoutRequests = async (req, res) => {
  try {
    // Admin chỉ nhận được yêu cầu sau khi chủ trọ xác nhận
    const requests = await CheckoutRequest.find({ status: { $in: ['pending_admin', 'confirmed'] } })
      .populate('user', 'username name email')
      .populate({
        path: 'booking',
        populate: [{ path: 'room' }, { path: 'user', select: 'username name email' }],
      })
      .populate('confirmedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    console.error('getAllCheckoutRequests error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: xác nhận trả phòng (tính phí trả trễ nếu quá 1 ngày sau endDate)
exports.confirmCheckoutRequest = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { requestId } = req.params;
    const { adminNote } = req.body || {};

    const request = await CheckoutRequest.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Yêu cầu không tồn tại' });
    if (request.status !== 'pending_admin') {
      return res.status(400).json({ success: false, message: 'Yêu cầu chưa được chủ trọ xác nhận hoặc đã được xử lý' });
    }

    const booking = await Booking.findById(request.booking).populate('room');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking không tồn tại' });

    const confirmedAt = new Date();
    const endDate = new Date(booking.endDate);
    endDate.setHours(0, 0, 0, 0);
    const diffMs = confirmedAt - endDate;
    const daysOverdue = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    // Quá 1 ngày thì mỗi ngày = giá phòng / 30 (miễn 1 ngày đầu)
    let lateFeeDays = 0;
    let lateFeeAmount = 0;
    if (daysOverdue > 1) {
      lateFeeDays = daysOverdue - 1;
      const pricePerDay = (booking.room?.price || 0) / 30;
      lateFeeAmount = Math.round(lateFeeDays * pricePerDay);
    }

    request.status = 'confirmed';
    request.confirmedBy = adminId;
    request.confirmedAt = confirmedAt;
    request.adminNote = adminNote || '';
    request.lateFeeDays = lateFeeDays;
    request.lateFeeAmount = lateFeeAmount;
    await request.save();

    booking.status = 'completed';
    await booking.save();

    // Hoàn tiền cọc cho khách: tiền cọc - phí trả trễ (nếu ở quá thì trừ, không quá thì trả full cọc)
    const depositAmount = booking.depositAmount ?? booking.room?.price ?? 0;
    const refundAmount = Math.max(0, Number(depositAmount) - Number(lateFeeAmount));
    if (refundAmount > 0) {
      let wallet = await Wallet.findOne({ user: request.user });
      if (!wallet) wallet = await Wallet.create({ user: request.user, balance: 0 });
      wallet.balance = Number(wallet.balance || 0) + refundAmount;
      wallet.updatedAt = new Date();
      await wallet.save();
      await HistoryBanking.create({
        user: request.user,
        amount: refundAmount,
        type: 'in',
        status: 'completed',
        note: `Hoàn tiền cọc trả phòng - Booking ${booking._id}${lateFeeAmount > 0 ? ` (đã trừ phí trả trễ ${lateFeeAmount} đ)` : ''}`,
      });
    }

    return res.json({
      success: true,
      message: 'Đã xác nhận trả phòng và hoàn tiền cọc cho khách',
      request: {
        ...request.toObject(),
        lateFeeDays,
        lateFeeAmount,
        depositAmount,
        refundAmount,
      },
    });
  } catch (err) {
    console.error('confirmCheckoutRequest error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
