const mongoose = require('mongoose');

const EarlyCheckoutRequestSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedCheckoutDate: { type: Date, required: true },
    reason: { type: String },
    refundAmount: { type: Number, required: true },
    penaltyFee: { type: Number, default: 0 },
    netRefund: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EarlyCheckoutRequest', EarlyCheckoutRequestSchema);
