const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    billingCycle: { type: String, enum: ['daily', 'monthly'], default: 'monthly' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentHistoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'HistoryBanking' },
    depositAmount: { type: Number }, // Tiền cọc (nếu không set thì dùng room.price khi hoàn cọc)
  },
  { timestamps: true }
);

// Index for fast overlap queries
BookingSchema.index({ room: 1, status: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
