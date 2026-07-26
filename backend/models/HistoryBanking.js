const mongoose = require('mongoose');

const HistoryBankingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['in', 'out'], default: 'in' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  note: { type: String },
  depositId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deposit' },
  // Gia hạn thuê phòng: khi admin approve sẽ cập nhật Booking.endDate
  extendBookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  extendMonthsToAdd: { type: Number, default: 0 },
  extendToDate: { type: Date },
  // Lưu trạng thái booking trước khi cập nhật endDate (dùng để hoàn tác khi chủ trọ từ chối)
  extendOldEndDate: { type: Date },
  extendOldBookingStatus: { type: String },
  // Trạng thái xác nhận của chủ trọ cho request gia hạn
  extendOwnerStatus: {
    type: String,
    enum: ['pending_payment', 'pending_owner', 'approved_owner', 'rejected_owner'],
    default: 'pending_payment',
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HistoryBanking', HistoryBankingSchema);
