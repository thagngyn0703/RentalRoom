const mongoose = require('mongoose');

const CheckoutRequestSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String },
    status: {
      type: String,
      enum: ['pending_owner', 'pending_admin', 'confirmed', 'rejected_owner'],
      default: 'pending_owner',
    },
    ownerNote: { type: String },
    ownerApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ownerApprovedAt: { type: Date },
    adminNote: { type: String },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    confirmedAt: { type: Date },
    // Tính khi admin xác nhận: từ ngày hết hạn đến lúc xác nhận, quá 1 ngày thì mỗi ngày = giá phòng/30
    lateFeeDays: { type: Number, default: 0 },
    lateFeeAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CheckoutRequest', CheckoutRequestSchema);
