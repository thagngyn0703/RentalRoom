
const Booking = require('../models/Booking');
const User = require('../models/Users');
const Room = require('../models/Room');
const HistoryBanking = require('../models/HistoryBanking');
const EarlyCheckoutRequest = require('../models/EarlyCheckoutRequest');
const mongoose = require('mongoose');

// Lấy danh sách booking cho admin
exports.getAllBookingsAdmin = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user')
      .populate('room')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách booking của user hiện tại
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const bookings = await Booking.find({ user: userId })
      .populate('room')
      .sort({ createdAt: -1 });

    // Booking nào đã có yêu cầu trả phòng sớm được admin phê duyệt → coi là đã thuê (hiển thị ở tab Đã thuê)
    const approvedEarlyCheckoutBookingIds = await EarlyCheckoutRequest.find({
      user: userId,
      status: 'approved',
    })
      .distinct('booking');

    const now = new Date();
    const isPastBooking = (b) => {
      if (b.status === 'completed') return true;
      if (b.status === 'confirmed' && new Date(b.endDate) <= now) return true;
      if (approvedEarlyCheckoutBookingIds.some(id => id.toString() === b._id.toString())) return true;
      return false;
    };
    const currentBookings = bookings.filter(b => !isPastBooking(b));
    const pastBookings = bookings.filter(isPastBooking);

    res.json({
      success: true,
      currentBookings,
      pastBookings,
      allBookings: bookings
    });
  } catch (err) {
    console.error('getMyBookings error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/bookings/my/:bookingId - Chi tiết 1 booking của user (để xem thông tin thuê phòng)
 */
exports.getMyBookingById = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ _id: bookingId, user: userId }).populate('room').lean();
    if (!booking) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn thuê' });
    return res.json({ success: true, booking });
  } catch (err) {
    console.error('getMyBookingById error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/bookings/availability?roomId=xxx&startDate=yyyy-mm-dd&endDate=yyyy-mm-dd
 * Returns { available: boolean, message?: string }
 * Two ranges overlap if: startA <= endB && endA >= startB
 */
exports.checkAvailability = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { roomId, startDate, endDate } = req.query;
    if (!roomId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu roomId, startDate hoặc endDate',
      });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return res.status(400).json({
        success: false,
        message: 'Khoảng ngày không hợp lệ',
      });
    }

    const room = await Room.findById(roomId).select('user').lean();
    if (room && userId && String(room.user) === String(userId)) {
      return res.json({
        success: true,
        available: false,
        message: 'Bạn không thể thuê phòng do chính mình đăng. Chỉ có thể thuê phòng của tài khoản khác.',
      });
    }

    const overlapping = await Booking.findOne({
      room: new mongoose.Types.ObjectId(roomId),
      status: { $in: ['pending', 'confirmed'] },
      $and: [{ startDate: { $lte: end } }, { endDate: { $gte: start } }],
    });

    if (overlapping) {
      return res.json({
        success: true,
        available: false,
        message: 'Phòng đã được thuê hoặc đang có người đặt trong khoảng thời gian này.',
      });
    }
    return res.json({ success: true, available: true });
  } catch (err) {
    console.error('checkAvailability error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: Xác nhận thanh toán booking
exports.confirmBooking = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { bookingId } = req.params;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Thiếu bookingId' });
    }

    // Tìm booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking không tồn tại' });
    }

    // Kiểm tra trạng thái
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể xác nhận booking có trạng thái pending. Hiện tại: ${booking.status}`,
      });
    }

    // Cập nhật trạng thái booking
    booking.status = 'confirmed';
    // Nếu billingCycle bị null, gán mặc định là 'monthly'
    if (!booking.billingCycle) {
      booking.billingCycle = 'monthly';
    }
    await booking.save();

    // Nếu có paymentHistoryId, cập nhật history banking
    if (booking.paymentHistoryId) {
      await HistoryBanking.findByIdAndUpdate(
        booking.paymentHistoryId,
        { status: 'completed' },
        { new: true }
      );
    }


    // --- GỬI THÔNG BÁO ---
    try {
      const Notification = require('../models/Notification');
      // Thông báo cho người thuê
      await Notification.create({
        user: booking.user,
        type: 'booking_confirmed',
        title: 'Yêu cầu thuê phòng thành công',
        body: `Bạn đã thuê phòng "${room.roomType}" tại địa chỉ ${room.address} thành công.`,
        data: {
          bookingId: String(booking._id),
          roomId: String(room._id),
          role: 'renter',
        },
      });
      // Thông báo cho chủ phòng
      await Notification.create({
        user: owner._id,
        type: 'booking_confirmed',
        title: 'Đã cho thuê phòng thành công',
        body: `Phòng "${room.roomType}" tại địa chỉ ${room.address} đã được thuê thành công.`,
        data: {
          bookingId: String(booking._id),
          roomId: String(room._id),
          role: 'owner',
        },
      });
    } catch (notifErr) {
      console.error('Gửi notification thất bại:', notifErr);
    }



    res.json({
      success: true,
      message: 'Xác nhận thanh toán thành công, đã cập nhật số dư và gửi thông báo/email',
      booking,
    });
  } catch (err) {
    console.error('confirmBooking error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: Từ chối duyệt thuê phòng → đặt status = cancelled, phòng sẽ hiển thị lại trên hệ thống
exports.rejectBooking = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { bookingId } = req.params;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Thiếu bookingId' });
    }

    const booking = await Booking.findById(bookingId).populate('room', 'roomType address').populate('user', 'username');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking không tồn tại' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể từ chối booking đang pending. Hiện tại: ${booking.status}`,
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        user: booking.user._id || booking.user,
        type: 'booking_rejected',
        title: 'Yêu cầu thuê phòng không được duyệt',
        body: `Yêu cầu thuê phòng "${booking.room?.roomType || 'phòng'}" tại ${booking.room?.address || ''} đã bị từ chối. Phòng vẫn có thể được đặt bởi người khác.`,
        data: { bookingId: String(booking._id), roomId: String(booking.room?._id || booking.room) },
      });
    } catch (notifErr) {
      console.error('Gửi notification thất bại:', notifErr);
    }

    return res.json({
      success: true,
      message: 'Đã từ chối yêu cầu thuê phòng. Phòng sẽ hiển thị lại trên hệ thống trong khoảng thời gian đó.',
      booking,
    });
  } catch (err) {
    console.error('rejectBooking error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
