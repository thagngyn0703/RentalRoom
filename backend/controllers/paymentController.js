const Wallet = require('../models/Wallet');
const HistoryBanking = require('../models/HistoryBanking');
const ApprovePaying = require('../models/ApprovePaying');
const Post = require('../models/Post');
const IsLandor = require('../models/IsLandor');
const Booking = require('../models/Booking');
const Deposit = require('../models/Deposit');
const Room = require('../models/Room');
const mongoose = require('mongoose');

// Return bank account info and create a pending history entry
exports.createPaymentRequest = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { amount, roomId, startDate, endDate, isDeposit, depositId } = req.body || {};
    const numeric = Number(amount) || 0;

    let fromDeposit = false;
    if (depositId) {
      const dep = await Deposit.findById(depositId);
      if (!dep || String(dep.user) !== String(userId) || dep.status !== 'approved') {
        return res.status(400).json({ success: false, message: 'Đặt cọc không hợp lệ hoặc chưa được xác nhận' });
      }
      if (dep.convertedToBookingId) {
        return res.status(400).json({ success: false, message: 'Đặt cọc này đã được chuyển sang đặt phòng' });
      }
      fromDeposit = true;
    }

    if (roomId && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
        return res.status(400).json({ success: false, message: 'Khoảng ngày thuê không hợp lệ' });
      }
      const room = await Room.findById(roomId).select('user').lean();
      if (room && String(room.user) === String(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Bạn không thể thuê phòng do chính mình đăng. Chỉ có thể thuê phòng của tài khoản khác.',
        });
      }
      if (!fromDeposit) {
        const overlapping = await Booking.findOne({
          room: new mongoose.Types.ObjectId(roomId),
          status: { $in: ['pending', 'confirmed'] },
          $and: [{ startDate: { $lte: end } }, { endDate: { $gte: start } }],
        });
        if (overlapping) {
          return res.status(409).json({
            success: false,
            message: 'Phòng đã được thuê hoặc đang có người đặt trong khoảng thời gian này.',
          });
        }
      }
    }

    const noteTime = new Date();
    let content;
    if (isDeposit && roomId) {
      content = `User ${userId} đặt cọc thuê phòng ${roomId} - ${numeric} Xu - ${noteTime.toISOString()}`;
    } else if (roomId) {
      content = `User ${userId} thanh toán thuê phòng ${roomId} - ${numeric} Xu - ${noteTime.toISOString()}`;
    } else {
      content = `User ${userId} mua ${numeric} Xu vào lúc ${noteTime.toISOString()}`;
    }

    const histPayload = { user: userId, amount: numeric, type: 'in', status: 'pending', note: content };
    if (depositId) histPayload.depositId = depositId;
    const hist = await HistoryBanking.create(histPayload);

    if (roomId && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isDeposit) {
        await Deposit.create({
          user: userId,
          room: roomId,
          amount: numeric,
          startDate: start,
          endDate: end,
          status: 'pending',
          paymentHistoryId: hist._id,
        });
      } else {
        const room = await Room.findById(roomId).select('price').lean();
        const depositAmount = room?.price ?? 0; // Tiền cọc mặc định = 1 tháng giá phòng
        await Booking.create({
          room: roomId,
          user: userId,
          startDate: start,
          endDate: end,
          billingCycle: 'monthly',
          status: 'pending',
          paymentHistoryId: hist._id,
          depositAmount,
        });
      }
    }

    // bank info from env
  const bankAccount = process.env.BANK_ACCOUNT || '000000000';
  const bankName = process.env.BANK_NAME || 'Ngân hàng mặc định';
  const bankCode = process.env.BANK_CODE || '';

  // simple vietqr payload-like string (frontend may render using vietqr lib)
  const vietqrPayload = `STK:${bankAccount};BANK:${bankName};AMOUNT:${numeric};CONTENT:${content}`;

  // Build VietQR image URL using environment variables following the canonical template:
  // https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
  const bankId = process.env.BANK_ID || bankCode || '';
  const accountNo = process.env.ACCOUNT_NO || bankAccount;
  const template = process.env.BANK_TEMPLATE || 'compact';
  const accountName = process.env.BANK_ACCOUNT_NAME || process.env.BANK_NAME || '';
  const vietqrImageUrl = bankId ? `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${numeric}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(accountName)}` : null;

  // create approve entry for admin to review and link to the history record

  return res.json({ success: true, data: { bankAccount, bankName, bankCode, content, amount: numeric, time: noteTime, vietqrPayload, vietqrImageUrl, historyId: hist._id } });
  } catch (err) {
    console.error('createPaymentRequest error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// User: request gia hạn thuê phòng
// Khi admin approve: hệ thống sẽ cập nhật Booking.endDate dựa trên HistoryBanking.extendToDate.
exports.createExtendPaymentRequest = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { bookingId, newEndDate, monthsToAdd, amount } = req.body || {};
    const numeric = Number(amount) || 0;
    const months = Number(monthsToAdd) || 0;

    if (!bookingId || !newEndDate || !months || numeric <= 0) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin gia hạn hoặc số tiền không hợp lệ' });
    }

    const booking = await Booking.findOne({ _id: bookingId, user: userId }).populate('room', 'price unit');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking không tồn tại' });
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Chỉ có thể gia hạn booking đã được xác nhận' });
    }

    const oldEnd = new Date(booking.endDate);
    const end = new Date(newEndDate);
    if (isNaN(oldEnd.getTime()) || isNaN(end.getTime()) || end <= oldEnd) {
      return res.status(400).json({ success: false, message: 'Ngày gia hạn không hợp lệ' });
    }

    const expected = Number(booking.room?.price || 0) * months;
    // allow small rounding differences from client
    if (Math.abs(Number(numeric) - Number(expected)) > 0.01) {
      return res.status(400).json({ success: false, message: 'Số tiền không khớp với số tháng gia hạn' });
    }

    const noteTime = new Date();
    const histPayload = {
      user: userId,
      amount: numeric,
      type: 'in',
      status: 'pending',
      note: `User ${userId} gia hạn thuê phòng ${booking.room?._id || booking.room} thêm ${months} tháng - ${numeric} Xu - ${noteTime.toISOString()}`,
      extendBookingId: bookingId,
      extendMonthsToAdd: months,
      extendToDate: end,
      // Chỉ chuyển sang "pending_owner" sau khi user bấm "Xác nhận đã thanh toán"
      extendOwnerStatus: 'pending_payment',
    };
    const hist = await HistoryBanking.create(histPayload);

    // bank info from env
    const bankAccount = process.env.BANK_ACCOUNT || '000000000';
    const bankName = process.env.BANK_NAME || 'Ngân hàng mặc định';
    const bankCode = process.env.BANK_CODE || '';

    const content = histPayload.note;
    const vietqrPayload = `STK:${bankAccount};BANK:${bankName};AMOUNT:${numeric};CONTENT:${content}`;

    const bankId = process.env.BANK_ID || bankCode || '';
    const accountNo = process.env.ACCOUNT_NO || bankAccount;
    const template = process.env.BANK_TEMPLATE || 'compact';
    const accountName = process.env.BANK_ACCOUNT_NAME || process.env.BANK_NAME || '';
    const vietqrImageUrl = bankId
      ? `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${numeric}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(accountName)}`
      : null;

    return res.json({
      success: true,
      data: {
        bankAccount,
        bankName,
        bankCode,
        content,
        amount: numeric,
        time: noteTime,
        vietqrPayload,
        vietqrImageUrl,
        historyId: hist._id,
      },
    });
  } catch (err) {
    console.error('createExtendPaymentRequest error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// User xác nhận đã thanh toán gia hạn
// Sau đó chủ trọ mới thấy yêu cầu ở trang owner-checkout-requests
exports.userConfirmExtendPaid = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Có 2 dạng client có thể gửi:
    // 1) Body: { historyId }
    // 2) URL: /extend/user/paid/:historyId (phiên bản frontend cũ)
    const { historyId: historyIdFromBody } = req.body || {};
    const historyIdFromParam = req.params?.historyId;
    const historyId = historyIdFromBody || historyIdFromParam;
    if (!historyId) return res.status(400).json({ success: false, message: 'Missing historyId' });

    const history = await HistoryBanking.findById(historyId);
    if (!history) return res.status(404).json({ success: false, message: 'Request not found' });
    if (String(history.user) !== String(userId)) return res.status(403).json({ success: false, message: 'Forbidden' });
    if (!history.extendBookingId) return res.status(400).json({ success: false, message: 'Invalid extend request' });
    if (history.extendOwnerStatus === 'pending_owner') {
      return res.json({ success: true, message: 'Bạn đã xác nhận trước đó. Chờ chủ trọ xử lý.' });
    }
    if (history.extendOwnerStatus !== 'pending_payment') {
      return res.status(400).json({ success: false, message: 'Request is not waiting for payment confirmation' });
    }

    // User đã xác nhận thanh toán thành công => cập nhật ngay endDate Booking.
    // Nếu chủ trọ từ chối => hoàn tác lại endDate về giá trị cũ.
    const bookingToExtend = await Booking.findById(history.extendBookingId);
    if (!bookingToExtend) return res.status(404).json({ success: false, message: 'Booking không tồn tại' });
    if (!history.extendToDate) return res.status(400).json({ success: false, message: 'Thiếu thông tin ngày gia hạn' });

    history.extendOldEndDate = history.extendOldEndDate || bookingToExtend.endDate;
    history.extendOldBookingStatus = history.extendOldBookingStatus || bookingToExtend.status;
    bookingToExtend.endDate = new Date(history.extendToDate);
    bookingToExtend.status = 'confirmed';
    await bookingToExtend.save();

    history.extendOwnerStatus = 'pending_owner';
    history.status = 'completed';
    await history.save();

    return res.json({ success: true, message: 'Đã xác nhận thanh toán. Chờ chủ trọ xử lý.' });
  } catch (err) {
    console.error('userConfirmExtendPaid error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// User: create an approve paying request (admin will review)
exports.createApproveRequest = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { historyId, amount } = req.body || {};
    let numeric = Number(amount) || 0;

    // If historyId provided, try to read amount from history when amount not provided
    if (historyId && (!numeric || numeric === 0)) {
      const hist = await HistoryBanking.findById(historyId);
      if (hist) numeric = Number(hist.amount) || 0;
    }

    if (!numeric || numeric <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    // Prevent duplicate pending approval for the same historyId or same user+amount
    if (historyId) {
      const exists = await ApprovePaying.findOne({ historyId: historyId, user: userId, approved: false });
      if (exists) return res.status(409).json({ success: false, message: 'Yêu cầu xác nhận đã được gửi trước đó' });
    } else {
      const exists = await ApprovePaying.findOne({ user: userId, amount: numeric, approved: false });
      if (exists) return res.status(409).json({ success: false, message: 'Yêu cầu xác nhận tương tự đã được gửi trước đó' });
    }

    // Lưu ý: với gia hạn thuê, chủ trọ sẽ thấy request ở trạng thái pending_owner ngay sau khi user bấm "Yêu cầu thanh toán".

    const approve = await ApprovePaying.create({ user: userId, amount: numeric, historyId: historyId || null });
    return res.json({ success: true, approve });
  } catch (err) {
    console.error('createApproveRequest error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user's payment history
exports.getMyHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const items = await HistoryBanking.find({ user: userId }).sort({ createdAt: -1 });
    return res.json({ success: true, items });
  } catch (err) {
    console.error('getMyHistory error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Owner: get rental payment transfer history for own rooms
exports.getOwnerRentalPaymentHistory = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const roomIds = await Room.find({ user: ownerId }).distinct('_id');
    if (!roomIds.length) return res.json({ success: true, items: [] });

    const bookings = await Booking.find({
      room: { $in: roomIds },
      paymentHistoryId: { $exists: true, $ne: null },
    })
      .populate('user', 'username email phone')
      .populate('room', 'roomType title address')
      .populate('paymentHistoryId', 'amount status type note createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const items = (bookings || [])
      .map((b) => {
        const hist = b.paymentHistoryId;
        if (!hist) return null;
        return {
          bookingId: b._id,
          room: b.room,
          tenant: b.user,
          amount: Number(hist.amount || 0),
          status: hist.status || 'pending',
          note: hist.note || '',
          paidAt: hist.createdAt || b.createdAt,
          bookingStartDate: b.startDate,
          bookingEndDate: b.endDate,
          bookingStatus: b.status,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.paidAt || 0) - new Date(a.paidAt || 0));

    return res.json({ success: true, items });
  } catch (err) {
    console.error('getOwnerRentalPaymentHistory error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Return wallet for current user
exports.getWallet = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) wallet = { balance: 0 };
    return res.json({ success: true, wallet });
  } catch (err) {
    console.error('getWallet error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Purchase a package: deduct from wallet and create history record
exports.purchasePackage = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { packageKey } = req.body || {};
    const packages = { '1m': 50000, '3m': 120000, '6m': 210000 };
    const price = packages[packageKey];
    if (!price) return res.status(400).json({ success: false, message: 'Invalid package' });

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) wallet = await Wallet.create({ user: userId, balance: 0 });

    if (Number(wallet.balance || 0) < Number(price)) {
      return res.status(402).json({ success: false, message: 'Insufficient balance', required: price });
    }

    // deduct
    wallet.balance = Number(wallet.balance || 0) - Number(price);
    wallet.updatedAt = new Date();
    await wallet.save();

    // create history record for outflow
    const hist = await HistoryBanking.create({ user: userId, amount: price, type: 'out', status: 'completed', note: `Buy package ${packageKey}` });

    // Extend or create IsLandor expiry for this user
    try {
      const monthsMap = { '1m': 1, '3m': 3, '6m': 6 };
      const months = monthsMap[packageKey] || 0;
      if (months > 0) {
        const now = new Date();
        let rec = await IsLandor.findOne({ user: userId });
        if (rec && rec.expiresAt && rec.expiresAt > now) {
          // extend existing expiry
          const newExpiry = new Date(rec.expiresAt);
          newExpiry.setMonth(newExpiry.getMonth() + months);
          rec.expiresAt = newExpiry;
          rec.updatedAt = new Date();
          await rec.save();
        } else {
          // create or reset expiry starting from now
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + months);
          if (!rec) {
            rec = await IsLandor.create({ user: userId, expiresAt });
          } else {
            rec.expiresAt = expiresAt;
            rec.updatedAt = new Date();
            await rec.save();
          }
        }
  // include isLandor info in response (record saved)
      }
    } catch (e) {
      console.error('Failed to update IsLandor record:', e);
    }

    return res.json({ success: true, wallet, hist });
  } catch (err) {
    console.error('purchasePackage error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: list pending approvals
exports.listPendingApprovals = async (req, res) => {
  try {
    // Chỉ hiển thị giao dịch extend khi chủ trọ đã xác nhận.
    const pending = await ApprovePaying.find({ approved: false }).sort({ createdAt: -1 }).populate('user', 'username email');

    const histories = await Promise.all(
      pending.map(async (p) => {
        if (!p.historyId) return { approveId: p._id, hist: null };
        const hist = await HistoryBanking.findById(p.historyId).select('extendBookingId extendOwnerStatus');
        return { approveId: p._id, hist };
      })
    );

    const histMap = new Map(histories.map((x) => [String(x.approveId), x.hist]));

    const items = pending.filter((p) => {
      const hist = histMap.get(String(p._id));
      // Nếu không phải extend => luôn hiển thị
      if (!hist?.extendBookingId) return true;
      // Nếu là extend => chỉ hiển thị khi chủ trọ đã xác nhận
      return hist.extendOwnerStatus === 'approved_owner';
    });

    return res.json({ success: true, items });
  } catch (err) {
    console.error('listPendingApprovals error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin approves a payment: verify admin then mark approved and credit wallet and update history
exports.approvePayment = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const approveId = req.params.id;
    const approve = await ApprovePaying.findById(approveId);
    if (!approve) return res.status(404).json({ success: false, message: 'Approve record not found' });
    if (approve.approved) return res.status(400).json({ success: false, message: 'Already approved' });

    // Nếu approve này là gia hạn thuê (extendBookingId tồn tại) thì chỉ cho admin approve khi chủ trọ đã xác nhận.
    if (approve.historyId) {
      const hist = await HistoryBanking.findById(approve.historyId).select('extendBookingId extendOwnerStatus');
      if (hist?.extendBookingId && hist?.extendOwnerStatus !== 'approved_owner') {
        return res.status(400).json({
          success: false,
          message: 'Chủ trọ chưa xác nhận gia hạn thuê phòng',
        });
      }
    }

    // mark as approved
    approve.approved = true;
    approve.admin = adminId;
    approve.approvedAt = new Date();
    await approve.save();

    // update history: if approve record links to a historyId, update that specific record
    let hist = null;
    if (approve.historyId) {
      hist = await HistoryBanking.findByIdAndUpdate(approve.historyId, { status: 'completed' }, { new: true });

      // 1) Gia hạn thuê: cập nhật Booking.endDate từ history.extendToDate
      if (hist?.extendBookingId && hist?.extendToDate) {
        const bookingToExtend = await Booking.findById(hist.extendBookingId);
        if (bookingToExtend) {
          bookingToExtend.endDate = new Date(hist.extendToDate);
          bookingToExtend.status = 'confirmed';
          await bookingToExtend.save();
        }
      } else {
        // 2) Thanh toán đặt cọc/thuê phòng theo flow cũ
        const booking = await Booking.findOne({ paymentHistoryId: approve.historyId });
        if (booking) {
          booking.status = 'confirmed';
          await booking.save();
          if (hist && hist.depositId) {
            await Deposit.findByIdAndUpdate(hist.depositId, { convertedToBookingId: booking._id });
          }
        }
      }
    } else {
      hist = await HistoryBanking.findOneAndUpdate({ user: approve.user, amount: approve.amount, status: 'pending' }, { status: 'completed' }, { new: true });
    }

    // credit user's wallet
    const WalletModel = Wallet;
    let wallet = await WalletModel.findOne({ user: approve.user });
    if (!wallet) wallet = await WalletModel.create({ user: approve.user, balance: 0 });
    wallet.balance = Number(wallet.balance || 0) + Number(approve.amount || 0);
    wallet.updatedAt = new Date();
    await wallet.save();

    return res.json({ success: true, approve, wallet, hist });
  } catch (err) {
    console.error('approvePayment error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Return whether current user has an active IsLandor (package)
exports.getIsLandorStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const rec = await IsLandor.findOne({ user: userId });
    const now = new Date();
    const isActive = !!(rec && rec.expiresAt && rec.expiresAt > now);
    return res.json({ success: true, isActive, expiresAt: rec ? rec.expiresAt : null });
  } catch (err) {
    console.error('getIsLandorStatus error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create deposit request
exports.createDepositRequest = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { amount, roomId, startDate, endDate } = req.body || {};
    const numeric = Number(amount) || 0;

    if (!roomId || !startDate || !endDate || numeric <= 0) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin hoặc số tiền không hợp lệ' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return res.status(400).json({ success: false, message: 'Khoảng ngày không hợp lệ' });
    }

    // Check availability
    const overlapping = await Booking.findOne({
      room: new mongoose.Types.ObjectId(roomId),
      status: { $in: ['pending', 'confirmed'] },
      $and: [{ startDate: { $lte: end } }, { endDate: { $gte: start } }],
    });
    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: 'Phòng đã được thuê hoặc đang có người đặt trong khoảng thời gian này.',
      });
    }

    // Create deposit
    const deposit = await Deposit.create({
      user: userId,
      room: roomId,
      amount: numeric,
      startDate: start,
      endDate: end,
      status: 'pending',
    });

    res.json({ success: true, message: 'Yêu cầu đặt cọc đã được gửi', deposit });
  } catch (err) {
    console.error('createDepositRequest error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Owner: lấy danh sách yêu cầu gia hạn thuê đang chờ chủ trọ xác nhận
exports.getPendingExtendRequestsForOwner = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const roomIds = await Room.find({ user: ownerId }).distinct('_id');
    if (!roomIds.length) return res.json({ success: true, requests: [] });

    const bookingIds = await Booking.find({ room: { $in: roomIds } }).distinct('_id');
    const histories = await HistoryBanking.find({
      extendBookingId: { $in: bookingIds },
      // Trả về cả lịch sử: pending/đã xác nhận/đã từ chối
      extendOwnerStatus: { $in: ['pending_owner', 'approved_owner', 'rejected_owner'] },
    })
      .populate('user', 'username email phone')
      .populate({
        path: 'extendBookingId',
        populate: { path: 'room', select: 'roomType address price unit beds baths images' },
      })
      .sort({ createdAt: -1 })
      .lean();

    const requests = (histories || []).map((h) => ({
      historyId: h._id,
      user: h.user,
      booking: h.extendBookingId,
      amount: h.amount,
      monthsToAdd: h.extendMonthsToAdd,
      newEndDate: h.extendToDate,
      extendOwnerStatus: h.extendOwnerStatus,
      createdAt: h.createdAt,
    }));

    return res.json({ success: true, requests });
  } catch (err) {
    console.error('getPendingExtendRequestsForOwner error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.ownerApproveExtendRequest = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { historyId } = req.params;
    const history = await HistoryBanking.findById(historyId).populate({
      path: 'extendBookingId',
      populate: { path: 'room', populate: { path: 'user', select: '_id' } },
    });
    if (!history) return res.status(404).json({ success: false, message: 'Yêu cầu không tồn tại' });
    if (!history.extendBookingId) return res.status(400).json({ success: false, message: 'Invalid extend request' });

    const roomOwnerId =
      history.extendBookingId?.room?.user?._id ? String(history.extendBookingId.room.user._id) : String(history.extendBookingId.room.user);

    if (roomOwnerId !== String(ownerId)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xác nhận' });
    }

    if (history.extendOwnerStatus !== 'pending_owner') {
      return res.status(400).json({ success: false, message: 'Yêu cầu không còn ở trạng thái chờ' });
    }

    history.extendOwnerStatus = 'approved_owner';
    history.status = 'completed';
    await history.save();

    return res.json({ success: true, message: 'Chủ trọ đã xác nhận gia hạn' });
  } catch (err) {
    console.error('ownerApproveExtendRequest error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.ownerRejectExtendRequest = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { historyId } = req.params;
    const history = await HistoryBanking.findById(historyId).populate({
      path: 'extendBookingId',
      populate: { path: 'room', populate: { path: 'user', select: '_id' } },
    });
    if (!history) return res.status(404).json({ success: false, message: 'Yêu cầu không tồn tại' });
    if (!history.extendBookingId) return res.status(400).json({ success: false, message: 'Invalid extend request' });

    const roomOwnerId =
      history.extendBookingId?.room?.user?._id ? String(history.extendBookingId.room.user._id) : String(history.extendBookingId.room.user);

    if (roomOwnerId !== String(ownerId)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền từ chối' });
    }

    if (history.extendOwnerStatus !== 'pending_owner') {
      return res.status(400).json({ success: false, message: 'Yêu cầu không còn ở trạng thái chờ' });
    }

    history.extendOwnerStatus = 'rejected_owner';
    history.status = 'failed'; // đánh dấu hủy để tránh xử lý sau

    // Hoàn tác Booking.endDate về giá trị cũ trước khi user xác nhận thanh toán
    if (history.extendBookingId && history.extendOldEndDate) {
      const bookingToRevert = await Booking.findById(history.extendBookingId._id || history.extendBookingId);
      if (bookingToRevert) {
        bookingToRevert.endDate = new Date(history.extendOldEndDate);
        bookingToRevert.status = history.extendOldBookingStatus || 'confirmed';
        await bookingToRevert.save();
      }
    }
    await history.save();

    return res.json({ success: true, message: 'Chủ trọ đã từ chối gia hạn' });
  } catch (err) {
    console.error('ownerRejectExtendRequest error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all deposits for admin
exports.getAllDepositsAdmin = async (req, res) => {
  try {
    const deposits = await Deposit.find()
      .populate('user')
      .populate('room')
      .sort({ createdAt: -1 });
    res.json(deposits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// User: đặt cọc của user (pending + approved chưa chuyển sang booking) để hiển thị tab Phòng đặt cọc
// Không hiển thị phòng đã gửi thanh toán nốt đang chờ admin xác nhận
exports.getMyDeposits = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const userObjectId = typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    // Các deposit đang có yêu cầu thanh toán nốt chờ duyệt → không hiển thị
    const pendingRemaining = await HistoryBanking.find(
      { status: 'pending', depositId: { $exists: true, $ne: null } },
      { depositId: 1 }
    );
    const hideDepositIds = pendingRemaining.map((h) => h.depositId).filter(Boolean);

    const deposits = await Deposit.find({
      user: userObjectId,
      _id: hideDepositIds.length ? { $nin: hideDepositIds } : { $exists: true },
      $or: [
        { status: 'pending' },
        {
          status: 'approved',
          $or: [{ convertedToBookingId: null }, { convertedToBookingId: { $exists: false } }],
        },
      ],
    })
      .populate('room')
      .sort({ createdAt: -1 });
    res.json({ success: true, deposits: deposits || [] });
  } catch (err) {
    console.error('getMyDeposits error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Approve deposit
exports.approveDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const deposit = await Deposit.findById(depositId);
    if (!deposit) return res.status(404).json({ success: false, message: 'Deposit not found' });

    if (deposit.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Deposit already processed' });
    }

    deposit.status = 'approved';
    deposit.approvedBy = adminId;
    deposit.approvedAt = new Date();
    await deposit.save();

    // Optionally create booking or something
    res.json({ success: true, message: 'Deposit approved', deposit });
  } catch (err) {
    console.error('approveDeposit error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reject deposit
exports.rejectDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const deposit = await Deposit.findById(depositId);
    if (!deposit) return res.status(404).json({ success: false, message: 'Deposit not found' });

    if (deposit.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Deposit already processed' });
    }

    deposit.status = 'rejected';
    deposit.approvedBy = adminId;
    deposit.approvedAt = new Date();
    await deposit.save();

    res.json({ success: true, message: 'Deposit rejected', deposit });
  } catch (err) {
    console.error('rejectDeposit error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
