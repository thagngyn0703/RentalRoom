const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Object, default: {} },
    readAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

// Một user chỉ nhận tối đa 1 thông báo per booking per triggerType ('7d' | '24h')
NotificationSchema.index(
  { user: 1, type: 1, 'data.bookingId': 1, 'data.triggerType': 1 },
  { unique: true, partialFilterExpression: { 'data.bookingId': { $exists: true }, 'data.triggerType': { $exists: true } } }
);

module.exports = mongoose.model('Notification', NotificationSchema);
