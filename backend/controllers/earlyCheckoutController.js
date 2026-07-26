const EarlyCheckoutRequest = require('../models/EarlyCheckoutRequest');
const Booking = require('../models/Booking');
const Wallet = require('../models/Wallet');
const HistoryBanking = require('../models/HistoryBanking');
const mongoose = require('mongoose');

// Tạo yêu cầu trả phòng sớm
exports.createEarlyCheckoutRequest = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { bookingId, requestedCheckoutDate, reason } = req.body;

    if (!bookingId || !requestedCheckoutDate) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bookingId hoặc requestedCheckoutDate' });
    }

    // Kiểm tra booking tồn tại và thuộc về user (populate room để tính tiền hoàn lại)
    const booking = await Booking.findOne({ _id: bookingId, user: userId, status: 'confirmed' })
      .populate('room');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking không tồn tại hoặc không thuộc về bạn' });
    }

    // Kiểm tra ngày yêu cầu
    const requestedDate = new Date(requestedCheckoutDate);
    const now = new Date();
    const bookingEndDate = new Date(booking.endDate);

    if (requestedDate <= now) {
      return res.status(400).json({ success: false, message: 'Ngày trả phòng phải sau ngày hiện tại' });
    }

    if (requestedDate >= bookingEndDate) {
      return res.status(400).json({ success: false, message: 'Ngày trả phòng phải trước ngày kết thúc hợp đồng' });
    }

    // Kiểm tra đã có yêu cầu nào chưa
    const existingRequest = await EarlyCheckoutRequest.findOne({
      booking: bookingId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return res.status(409).json({ success: false, message: 'Đã có yêu cầu trả phòng sớm đang xử lý' });
    }

    // Tính toán tiền hoàn lại
    const { refundAmount, penaltyFee, netRefund } = calculateRefund(booking, requestedDate);

    // Tạo yêu cầu
    const request = await EarlyCheckoutRequest.create({
      booking: bookingId,
      user: userId,
      requestedCheckoutDate: requestedDate,
      reason: reason || '',
      refundAmount,
      penaltyFee,
      netRefund,
    });

    res.json({
      success: true,
      message: 'Yêu cầu trả phòng sớm đã được gửi',
      request,
    });
  } catch (err) {
    console.error('createEarlyCheckoutRequest error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Lấy danh sách yêu cầu của user
exports.getMyEarlyCheckoutRequests = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const requests = await EarlyCheckoutRequest.find({ user: userId })
      .populate('booking')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests,
    });
  } catch (err) {
    console.error('getMyEarlyCheckoutRequests error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: Lấy tất cả yêu cầu (mới nhất trước), populate đủ room + user để hiển thị
exports.getAllEarlyCheckoutRequests = async (req, res) => {
  try {
    const requests = await EarlyCheckoutRequest.find()
      .populate('user', 'username name email')
      .populate({
        path: 'booking',
        populate: [
          { path: 'room' },
          { path: 'user', select: 'username name email' },
        ],
      })
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests,
    });
  } catch (err) {
    console.error('getAllEarlyCheckoutRequests error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: Phê duyệt yêu cầu
exports.approveEarlyCheckoutRequest = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { requestId } = req.params;
    const { adminNote } = req.body;

    const request = await EarlyCheckoutRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Yêu cầu không tồn tại' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Yêu cầu đã được xử lý' });
    }

    // Cập nhật booking
    const booking = await Booking.findById(request.booking);
    if (booking) {
      booking.endDate = request.requestedCheckoutDate;
      booking.status = 'completed'; // Đánh dấu hoàn thành sớm
      await booking.save();
    }

    // Hoàn tiền vào ví user
    if (request.netRefund > 0) {
      let wallet = await Wallet.findOne({ user: request.user });
      if (!wallet) {
        wallet = await Wallet.create({ user: request.user, balance: 0 });
      }
      wallet.balance = Number(wallet.balance || 0) + Number(request.netRefund);
      wallet.updatedAt = new Date();
      await wallet.save();

      // Tạo lịch sử giao dịch
      await HistoryBanking.create({
        user: request.user,
        amount: request.netRefund,
        type: 'in',
        status: 'completed',
        note: `Hoàn tiền trả phòng sớm - Booking ${booking?._id}`,
      });
    }

    // Cập nhật yêu cầu
    request.status = 'approved';
    request.approvedBy = adminId;
    request.approvedAt = new Date();
    request.processedAt = new Date();
    request.adminNote = adminNote || '';
    await request.save();

    res.json({
      success: true,
      message: 'Đã phê duyệt yêu cầu trả phòng sớm',
      request,
    });
  } catch (err) {
    console.error('approveEarlyCheckoutRequest error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: Từ chối yêu cầu
exports.rejectEarlyCheckoutRequest = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { requestId } = req.params;
    const { adminNote } = req.body;

    const request = await EarlyCheckoutRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Yêu cầu không tồn tại' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Yêu cầu đã được xử lý' });
    }

    // Cập nhật yêu cầu
    request.status = 'rejected';
    request.approvedBy = adminId;
    request.approvedAt = new Date();
    request.processedAt = new Date();
    request.adminNote = adminNote || '';
    await request.save();

    res.json({
      success: true,
      message: 'Đã từ chối yêu cầu trả phòng sớm',
      request,
    });
  } catch (err) {
    console.error('rejectEarlyCheckoutRequest error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Hàm tính toán tiền hoàn lại
function calculateRefund(booking, requestedDate) {
  const startDate = new Date(booking.startDate);
  const originalEndDate = new Date(booking.endDate);
  const actualCheckoutDate = new Date(requestedDate);

  // Giả sử giá phòng là theo tháng
  const monthlyPrice = booking.room?.price || 0;
  const dailyPrice = Math.round(monthlyPrice / 30); // Giả sử 30 ngày/tháng

  // Tính số ngày còn lại
  const daysRemaining = Math.max(0, Math.ceil((originalEndDate - actualCheckoutDate) / (1000 * 60 * 60 * 24)));

  // Tiền hoàn lại
  const refundAmount = daysRemaining * dailyPrice;

  // Phí phạt: 10% nếu thông báo trước < 30 ngày
  const daysNotice = Math.ceil((actualCheckoutDate - new Date()) / (1000 * 60 * 60 * 24));
  const penaltyFee = daysNotice < 30 ? refundAmount * 0.1 : 0;

  // Tiền thực nhận (đã trừ phí phạt và tiền đặt cọc)
  const depositAmount = booking.depositAmount || 0;
  const netRefund = Math.max(0, refundAmount - penaltyFee - depositAmount);

  return { refundAmount, penaltyFee, netRefund };
}
