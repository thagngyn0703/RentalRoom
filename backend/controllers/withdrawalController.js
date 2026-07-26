const WithdrawalRequest = require('../models/WithdrawalRequest');
const Wallet = require('../models/Wallet');

const COMMISSION_PERCENT = 10;

exports.getCommissionPercent = () => COMMISSION_PERCENT;

exports.create = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { amount, bankAccountName, bankAccountNumber, bankQrImage } = req.body || {};
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 1000) {
      return res.status(400).json({ success: false, message: 'Số tiền rút phải từ 1.000 trở lên' });
    }
    if (!bankAccountName?.trim() || !bankAccountNumber?.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên và số tài khoản' });
    }

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) wallet = await Wallet.create({ user: userId, balance: 0 });
    const balance = Number(wallet.balance || 0);
    if (balance < numAmount) {
      return res.status(402).json({
        success: false,
        message: 'Số dư không đủ',
        balance,
        required: numAmount,
      });
    }

    const doc = await WithdrawalRequest.create({
      user: userId,
      amount: numAmount,
      bankAccountName: bankAccountName.trim(),
      bankAccountNumber: bankAccountNumber.trim(),
      bankQrImage: bankQrImage || null,
      status: 'pending',
    });

    const request = await WithdrawalRequest.findById(doc._id).populate('user', 'username email').lean();
    return res.status(201).json({ success: true, request });
  } catch (err) {
    console.error('withdrawal create error', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.listMine = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const list = await WithdrawalRequest.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({ success: true, list });
  } catch (err) {
    console.error('withdrawal listMine error', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.listPendingAdmin = async (req, res) => {
  try {
    const list = await WithdrawalRequest.find({ status: 'pending' })
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, list });
  } catch (err) {
    console.error('withdrawal listPendingAdmin error', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.approve = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    const { id } = req.params;

    const request = await WithdrawalRequest.findById(id);
    if (!request) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Yêu cầu đã được xử lý' });
    }

    let wallet = await Wallet.findOne({ user: request.user });
    if (!wallet) wallet = await Wallet.create({ user: request.user, balance: 0 });
    const balance = Number(wallet.balance || 0);
    const amount = Number(request.amount || 0);
    if (balance < amount) {
      return res.status(402).json({
        success: false,
        message: 'Số dư chủ phòng không đủ để trừ',
        balance,
        required: amount,
      });
    }

    wallet.balance = balance - amount;
    wallet.updatedAt = new Date();
    await wallet.save();

    request.status = 'approved';
    request.processedBy = adminId;
    request.processedAt = new Date();
    await request.save();

    const updated = await WithdrawalRequest.findById(id).populate('user', 'username email').lean();
    return res.json({ success: true, request: updated, message: 'Đã xác nhận rút tiền' });
  } catch (err) {
    console.error('withdrawal approve error', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.cancel = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;

    const request = await WithdrawalRequest.findById(id);
    if (!request) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu' });
    if (String(request.user) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền hủy yêu cầu này' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Chỉ có thể hủy yêu cầu đang chờ duyệt' });
    }

    request.status = 'cancelled';
    request.processedAt = new Date();
    await request.save();

    const updated = await WithdrawalRequest.findById(id).populate('user', 'username email').lean();
    return res.json({ success: true, request: updated, message: 'Đã hủy yêu cầu rút tiền' });
  } catch (err) {
    console.error('withdrawal cancel error', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.reject = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    const { id } = req.params;
    const { adminNote } = req.body || {};

    const request = await WithdrawalRequest.findById(id);
    if (!request) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Yêu cầu đã được xử lý' });
    }

    request.status = 'rejected';
    request.processedBy = adminId;
    request.processedAt = new Date();
    if (adminNote != null) request.adminNote = String(adminNote);
    await request.save();

    const updated = await WithdrawalRequest.findById(id).populate('user', 'username email').lean();
    return res.json({ success: true, request: updated, message: 'Đã từ chối yêu cầu' });
  } catch (err) {
    console.error('withdrawal reject error', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
